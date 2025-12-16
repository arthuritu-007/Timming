import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Profile } from './types';

export const AdminPanel = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert('Error updating role: ' + error);
    }
  };

  if (loading) return <div>Cargando panel de admin...</div>;

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 mt-8">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Panel de Administración</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-700 bg-gray-800">
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-gray-600 text-gray-200'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleRole(user.id, user.role)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm hover:underline"
                  >
                    Cambiar a {user.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
