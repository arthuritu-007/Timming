import React, { useEffect, useState } from 'react';
import { Timing } from '../types';
import { getTimingStatus } from '../utils';
import { format, formatDistanceToNow, differenceInSeconds, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Timer, Clock } from 'lucide-react';
import { supabase } from '../supabase';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { UpdateTimingModal } from './UpdateTimingModal';

interface TimingCardProps {
  timing: Timing;
}

export const TimingCard: React.FC<TimingCardProps> = ({ timing }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const lastTimingDate = parseISO(timing.last_timing);
  const { isExpired, expirationTime } = getTimingStatus(lastTimingDate);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const secondsLeft = differenceInSeconds(expirationTime, now);

      if (secondsLeft <= 0) {
        setTimeLeft('00:00:00');
      } else {
        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expirationTime]);

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este timing? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('timings')
        .delete()
        .eq('id', timing.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No tienes permiso para borrar. Revisa las "Policies" en Supabase.');
      }
    } catch (error: any) {
      alert('Error: ' + (error.message || error));
    }
  };

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-black/80 shadow-[0_0_15px_rgba(255,0,0,0.1)] border border-red-900/30 backdrop-blur-md group hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-300">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-red-950/30 pointer-events-none" />
      
      {/* Image Header */}
      <div className="relative h-40 w-full overflow-hidden border-b border-red-900/30">
        <img
          src={timing.photo_url || 'https://via.placeholder.com/400x300'}
          alt={timing.description}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
        />
        <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/50 uppercase tracking-wider shadow-sm backdrop-blur-md">
          Libre
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] uppercase tracking-wide">
            {timing.title}
          </h3>
          <p className="text-red-200/70 text-sm font-medium truncate">
            {timing.description}
          </p>
        </div>

        {/* Status Block */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase text-red-400">Último timing:</span>
            <span className="font-mono text-sm tracking-wide text-white">
              {format(lastTimingDate, 'HH:mm:ss')}
            </span>
          </div>
          <div className="text-xs text-red-300/50 pl-6">
            {format(lastTimingDate, 'dd/MM/yyyy')} — hace{' '}
            {formatDistanceToNow(lastTimingDate, { locale: es, addSuffix: false })}
          </div>
        </div>
        
        {/* Countdown / Status */}
        <div className="flex items-center gap-2 py-1 bg-red-950/20 rounded px-2 -mx-2 border border-red-900/20">
           <div className={clsx(
             "text-sm font-bold uppercase",
             isExpired ? "text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
           )}>
             {isExpired ? "Disponible para tomar" : "En disputa (Posible)"}
           </div>
           {!isExpired && (
             <span className="ml-auto font-mono text-xs text-red-200 bg-red-900/50 px-2 py-0.5 rounded border border-red-800">
               {timeLeft}
             </span>
           )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button 
            disabled={!isAdmin}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 disabled:from-gray-900 disabled:to-gray-900 disabled:text-gray-600 disabled:border-gray-800 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded border border-purple-500/50 shadow-md transition-all"
          >
            <Timer className="w-3.5 h-3.5" />
            Timear
          </button>
          
          {isAdmin && (
            <button 
              onClick={handleDelete}
              className="flex items-center justify-center p-2.5 bg-red-950/50 hover:bg-red-900 text-red-500 hover:text-red-400 rounded border border-red-900 hover:border-red-500 transition-colors"
              title="Eliminar Timing"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
