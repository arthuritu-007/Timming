import React, { useState } from 'react';
import { supabase } from './supabase';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Registro exitoso! Por favor inicia sesión.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
         <img 
            src="/bg.png" 
            alt="Background" 
            className="w-full h-full object-contain opacity-40 max-w-[100vw] max-h-[100vh]"
            onError={(e) => {
              console.error('Error loading login background image', e);
              const img = e.target as HTMLImageElement;
              if (img.src.includes('/bg.png')) {
                img.src = 'bg.png';
              }
            }}
         />
      </div>

      <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">
          {mode === 'signin' ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : (mode === 'signin' ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          {mode === 'signin' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button onClick={() => setMode('signup')} className="text-cyan-400 hover:underline">
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setMode('signin')} className="text-cyan-400 hover:underline">
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
