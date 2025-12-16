import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Timing } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './Login';
import { AdminPanel } from './Admin';
import { Watermark } from './Watermark';
import { TimingCard } from './components/TimingCard';
import { AddTimingModal } from './components/AddTimingModal';
import { Plus, LayoutGrid, ListFilter, LogOut, Shield } from 'lucide-react';

const MainApp = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [timings, setTimings] = useState<Timing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    fetchTimings();
    
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('timings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timings' },
        (payload) => {
          fetchTimings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTimings = async () => {
    const { data, error } = await supabase
      .from('timings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching timings:', error);
    if (data) setTimings(data);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200 p-6 md:p-8 font-sans relative">
      <Watermark />

      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
              Control de Timings
            </h1>
            <p className="text-slate-400 text-sm">Sistema de gestión de zonas y disputas</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {isAdmin && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className={`p-2 rounded-lg border transition-colors ${showAdmin ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'}`}
                title="Panel de Administración"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}

            <div className="hidden md:flex bg-slate-800/50 rounded-lg p-1 border border-slate-700">
              <button className="p-2 text-emerald-400 bg-slate-700/50 rounded shadow-sm">
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <ListFilter className="w-5 h-5" />
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Timing</span>
              </button>
            )}

            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 font-bold py-2.5 px-4 rounded-lg border border-slate-700 hover:border-red-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {showAdmin && isAdmin && <AdminPanel />}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {timings.map((timing) => (
            <TimingCard key={timing.id} timing={timing} />
          ))}
          
          {/* Empty State / Add New Placeholder - Only for Admin */}
          {timings.length === 0 && isAdmin && (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center min-h-[320px] rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <h3 className="text-slate-300 font-bold">Sin registros</h3>
              <p className="text-slate-500 text-sm">Click para agregar uno nuevo</p>
            </div>
          )}
          
          {timings.length === 0 && !isAdmin && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No hay timings activos en este momento.
            </div>
          )}
        </div>
      </div>

      <AddTimingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
