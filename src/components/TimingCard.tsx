import React, { useEffect, useState } from 'react';
import { Timing } from '../types';
import { getTimingStatus } from '../utils';
import { format, formatDistanceToNow, differenceInSeconds, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MapPin, Flag, Timer } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface TimingCardProps {
  timing: Timing;
}

export const TimingCard: React.FC<TimingCardProps> = ({ timing }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
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

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-slate-900/90 shadow-lg border border-slate-700/50 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 pointer-events-none" />
      
      {/* Image Header */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={timing.photo_url || 'https://via.placeholder.com/400x300'}
          alt={timing.description}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-slate-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md">
          Libre
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            {timing.title}
          </h3>
          <p className="text-slate-300 text-sm font-medium truncate">
            {timing.description}
          </p>
        </div>

        {/* Status Block */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase text-slate-400">Último timing:</span>
            <span className="font-mono text-sm tracking-wide">
              {format(lastTimingDate, 'HH:mm:ss')}
            </span>
          </div>
          <div className="text-xs text-slate-500 pl-6">
            {format(lastTimingDate, 'dd/MM/yyyy')} — hace{' '}
            {formatDistanceToNow(lastTimingDate, { locale: es, addSuffix: false })}
          </div>
        </div>
        
        {/* Countdown / Status */}
        <div className="flex items-center gap-2 py-1">
           <div className={clsx(
             "text-sm font-bold",
             isExpired ? "text-emerald-500" : "text-amber-500"
           )}>
             {isExpired ? "Disponible para tomar" : "En disputa (Posible)"}
           </div>
           {!isExpired && (
             <span className="ml-auto font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
               {timeLeft}
             </span>
           )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button 
            disabled={!isAdmin}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-3 rounded shadow-md transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            Localizar
          </button>
          <button 
            disabled={!isAdmin}
            className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-3 rounded shadow-md transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Conquistar
          </button>
        </div>
        <button 
          disabled={!isAdmin}
          className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded shadow-md mt-2 transition-colors"
        >
          <Timer className="w-3.5 h-3.5" />
          Timear
        </button>
      </div>
    </div>
  );
};
