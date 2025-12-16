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

      <div className="max-w-md w-full bg-black/80 backdrop-blur-md rounded-xl p-8 shadow-[0_0_30px_rgba(220,38,38,0.2)] border border-red-900/50 relative z-10">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-white uppercase tracking-wider drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" style={{ fontFamily: 'Impact, sans-serif' }}>
          {mode === 'signin' ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
        </h2>
        
        {error && (
          <div className="bg-red-950/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm flex items-center gap-2">
            <span className="block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-red-500 uppercase mb-1 tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-red-900/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-red-500 uppercase mb-1 tracking-wide">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-red-900/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide mt-2 border border-red-500"
          >
            {loading ? 'CARGANDO...' : (mode === 'signin' ? 'ENTRAR' : 'REGISTRARSE')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'signin' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button onClick={() => setMode('signup')} className="text-red-400 hover:text-red-300 font-bold hover:underline ml-1">
                REGÍSTRATE AQUÍ
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setMode('signin')} className="text-red-400 hover:text-red-300 font-bold hover:underline ml-1">
                INICIA SESIÓN
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
