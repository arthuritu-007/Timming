import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Timing } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './Login';
import { AdminPanel } from './Admin';
import { Watermark } from './Watermark';
import { TimingCard } from './components/TimingCard';
import { AddTimingModal } from './components/AddTimingModal';
import { UpdateTimingModal } from './components/UpdateTimingModal';
import { Plus, LayoutGrid, ListFilter, LogOut, Shield, Search } from 'lucide-react';

const MainApp = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [timings, setTimings] = useState<Timing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTiming, setSelectedTiming] = useState<Timing | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTimings();
    const interval = setInterval(() => {
      // Force re-render to update countdowns
      setTimings(prev => [...prev]);
    }, 1000);

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('timings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'timings' }, 
        () => {
          fetchTimings();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const fetchTimings = async () => {
    try {
      // Fetch timings ordered by creation date
      const { data, error } = await supabase
        .from('timings')
        .select('*')
        .order('created_at', { ascending: true }); // Oldest first, new ones at the bottom

      if (error) throw error;
      setTimings(data || []);
    } catch (error) {
      console.error('Error fetching timings:', error);
    }
  };

  if (!user) {
    return <Login />;
  }

  const filteredTimings = timings.filter(timing => 
    timing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    timing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group timings by title
  const groupedTimings = filteredTimings.reduce((acc, timing) => {
    const key = timing.title.toUpperCase(); // Normalize to uppercase for grouping
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(timing);
    return acc;
  }, {} as Record<string, Timing[]>);

  return (
    <div className="min-h-screen bg-black text-slate-200 p-6 md:p-8 font-sans relative">
      <Watermark />

      {/* Background Decorations - Fixed Image */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
         <img 
            src="/bg.png" 
            alt="Background" 
            className="w-full h-full object-contain opacity-50 max-w-[100vw] max-h-[100vh]"
            onError={(e) => {
              console.error('Error loading background image', e);
              // Fallback to try loading without leading slash if relative path issue
              const img = e.target as HTMLImageElement;
              if (img.src.includes('/bg.png')) {
                img.src = 'bg.png';
              }
            }}
         />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-red-900/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white tracking-tight drop-shadow-[0_2px_2px_rgba(255,0,0,0.5)]" style={{ fontFamily: 'Impact, sans-serif', letterSpacing: '1px' }}>
              CONTROL DE TIMINGS
            </h1>
            <p className="text-red-200/70 text-sm font-medium">SISTEMA DE GESTIÓN DE ZONAS Y DISPUTAS</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:flex-none min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-red-500" />
              </div>
              <input
                type="text"
                placeholder="Buscar zona..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-red-900/50 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block pl-10 p-2.5 placeholder-red-900/50"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className={`p-2 rounded-lg border transition-colors ${showAdmin ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-black/50 border-red-900/50 text-red-400 hover:text-white hover:border-red-500'}`}
                title="Panel de Administración"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 border border-red-500"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">NUEVO TIMING</span>
                <span className="sm:hidden">NUEVO</span>
              </button>
            )}

            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-black/80 hover:bg-red-950 text-red-400 hover:text-red-200 font-bold py-2.5 px-4 rounded-lg border border-red-900/50 hover:border-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {showAdmin && isAdmin && <AdminPanel />}

        {/* Grouped Timings */}
        <div className="space-y-12">
          {Object.entries(groupedTimings).map(([title, groupTimings]) => (
            <div key={title} className="space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] border-l-4 border-red-600 pl-4" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {title}
                </h2>
                <div className="h-px bg-gradient-to-r from-red-900/50 to-transparent flex-1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupTimings.map((timing) => (
                  <TimingCard 
                    key={timing.id} 
                    timing={timing} 
                    onTimear={(t) => setSelectedTiming(t)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredTimings.length === 0 && searchQuery && (
            <div className="text-center py-12 text-red-400/50 font-medium tracking-wider border border-dashed border-red-900/30 rounded-xl bg-black/40">
              NO SE ENCONTRARON RESULTADOS PARA "{searchQuery}".
            </div>
          )}

          {timings.length === 0 && !searchQuery && isAdmin && (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center min-h-[320px] rounded-xl border-2 border-dashed border-red-900/50 bg-black/60 hover:border-red-500 hover:bg-red-950/20 transition-all cursor-pointer group backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-red-500 group-hover:bg-red-900/40">
                <Plus className="w-8 h-8 text-red-500 group-hover:text-red-400" />
              </div>
              <h3 className="text-red-100 font-bold tracking-wide uppercase">Sin registros</h3>
              <p className="text-red-400/60 text-sm">Click para agregar uno nuevo</p>
            </div>
          )}
          
          {timings.length === 0 && !isAdmin && (
            <div className="text-center py-12 text-red-400/50 font-medium tracking-wider">
              NO HAY TIMINGS ACTIVOS EN ESTE MOMENTO.
            </div>
          )}
        </div>
      </div>

      <AddTimingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {selectedTiming && (
        <UpdateTimingModal 
          isOpen={!!selectedTiming}
          onClose={() => setSelectedTiming(null)}
          timingId={selectedTiming.id}
          currentTiming={selectedTiming.last_timing}
          timingTitle={selectedTiming.title}
        />
      )}

      {/* Footer Signature */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
        <span 
          className="text-white text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          By : <span className="text-red-500">!Kyt</span>
        </span>
      </div>
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
