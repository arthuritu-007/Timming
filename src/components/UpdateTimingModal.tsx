import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { supabase } from '../supabase';
import { parseISO } from 'date-fns';

interface UpdateTimingModalProps {
  isOpen: boolean;
  onClose: () => void;
  timingId: string;
  currentTiming: string;
  timingTitle: string;
}

export const UpdateTimingModal: React.FC<UpdateTimingModalProps> = ({ 
  isOpen, 
  onClose, 
  timingId, 
  currentTiming,
  timingTitle
}) => {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [second, setSecond] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentTiming) {
      const date = parseISO(currentTiming);
      let h = date.getHours();
      const m = date.getMinutes();
      const s = date.getSeconds();
      
      const p = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12; // the hour '0' should be '12'

      setHour(h.toString().padStart(2, '0'));
      setMinute(m.toString().padStart(2, '0'));
      setSecond(s.toString().padStart(2, '0'));
      setPeriod(p);
    }
  }, [isOpen, currentTiming]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construct the new date object
      const now = new Date();
      let h = parseInt(hour);
      const m = parseInt(minute);
      const s = parseInt(second);

      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;

      const newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s);
      
      // If the resulting time is in the future (e.g. it's 10AM and we set 11PM), 
      // assume it was yesterday? Or just trust the user means today?
      // Usually "Timear" is recording a past event. 
      // If the user inputs a time that is significantly in the future relative to "now", 
      // it might mean yesterday. But for simplicity, let's default to TODAY. 
      // The user can manage the date if I added a date picker, but they asked for Time.
      
      const { error } = await supabase
        .from('timings')
        .update({ last_timing: newDate.toISOString() })
        .eq('id', timingId);

      if (error) throw error;
      
      onClose();
    } catch (error: any) {
      alert('Error updating timing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Input handlers to ensure 2 digits
  const handleBlur = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, max: number, min: number = 0) => {
    let val = parseInt(value);
    if (isNaN(val)) val = min;
    if (val > max) val = max;
    if (val < min) val = min;
    setter(val.toString().padStart(2, '0'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-black border border-red-900 shadow-[0_0_50px_rgba(220,38,38,0.2)] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-900/50 bg-red-950/10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white tracking-wide uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
              ACTUALIZAR TIMING
            </h2>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-red-200 font-medium uppercase tracking-wider text-sm mb-1">Zona</h3>
            <p className="text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">{timingTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center gap-2 md:gap-4">
              {/* Hour */}
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-bold text-red-500 uppercase">Hora</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  onBlur={(e) => handleBlur(setHour, e.target.value, 12, 1)}
                  className="w-16 h-16 text-center text-3xl font-bold bg-black border-2 border-red-900 rounded-lg text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all placeholder-red-900/50"
                />
              </div>
              
              <span className="text-4xl font-bold text-red-600 mt-4">:</span>

              {/* Minute */}
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-bold text-red-500 uppercase">Min</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  onBlur={(e) => handleBlur(setMinute, e.target.value, 59)}
                  className="w-16 h-16 text-center text-3xl font-bold bg-black border-2 border-red-900 rounded-lg text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all placeholder-red-900/50"
                />
              </div>

              <span className="text-4xl font-bold text-red-600 mt-4">:</span>

              {/* Second */}
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-bold text-red-500 uppercase">Seg</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={second}
                  onChange={(e) => setSecond(e.target.value)}
                  onBlur={(e) => handleBlur(setSecond, e.target.value, 59)}
                  className="w-16 h-16 text-center text-3xl font-bold bg-black border-2 border-red-900 rounded-lg text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all placeholder-red-900/50"
                />
              </div>

              {/* AM/PM */}
              <div className="flex flex-col gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={`px-3 py-1.5 rounded font-bold text-sm transition-all ${
                    period === 'AM' 
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' 
                      : 'bg-red-950/30 text-red-700 hover:bg-red-900/50'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  className={`px-3 py-1.5 rounded font-bold text-sm transition-all ${
                    period === 'PM' 
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' 
                      : 'bg-red-950/30 text-red-700 hover:bg-red-900/50'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-4 rounded-lg shadow-lg border border-red-500 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Nuevo Timing
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
