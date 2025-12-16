import React, { useState } from 'react';
import { X, Calendar, Image } from 'lucide-react';
import { supabase } from '../supabase';

interface AddTimingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTimingModal: React.FC<AddTimingModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Davis',
    description: '',
    imageUrl: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } catch (error) {
      alert('Error uploading image: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time || !formData.description) return;

    setLoading(true);
    // Combine date and time
    const dateTimeString = `${formData.date}T${formData.time}`;
    const lastTiming = new Date(dateTimeString).toISOString();

    try {
      const { error } = await supabase.from('timings').insert([
        {
          title: formData.title,
          description: formData.description,
          photo_url: formData.imageUrl || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=gta%20rp%20location%20street%20night&image_size=landscape_4_3',
          last_timing: lastTiming,
        }
      ]);

      if (error) throw error;

      onClose();
      setFormData({
        title: 'Davis',
        description: '',
        imageUrl: '',
        time: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      alert('Error saving timing: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-black rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] border border-red-900/50 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 bg-red-950/20 border-b border-red-900/50">
          <h2 className="text-lg font-extrabold text-white uppercase tracking-wider font-impact">Agregar Nuevo Timing</h2>
          <button 
            onClick={onClose}
            className="text-red-500 hover:text-white transition-colors hover:rotate-90 duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-red-500 uppercase mb-1 tracking-wide">Título / Zona</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/50 border border-red-900/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
              placeholder="Ej: Davis"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-red-500 uppercase mb-1 tracking-wide">Descripción / Lugar</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/50 border border-red-900/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
              placeholder="Ej: Vías del tren"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-red-500 uppercase mb-1 tracking-wide">Imagen</label>
            <div 
              onClick={() => document.getElementById('file-upload')?.click()}
              className={`w-full bg-black/50 border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer group hover:bg-red-900/10 ${dragActive ? 'border-red-500 bg-red-900/20' : 'border-red-900/50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.imageUrl ? (
                <div className="relative group/preview" onClick={(e) => e.stopPropagation()}>
                  <img src={formData.imageUrl} alt="Preview" className="h-32 w-full object-cover rounded-md border border-red-900/50" />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, imageUrl: ''})}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="p-4 bg-red-900/20 rounded-full border border-red-900/30 group-hover:scale-110 transition-transform duration-300">
                      <Image className="w-8 h-8 text-red-500" /> 
                    </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm font-medium text-red-200 group-hover:text-red-100 transition-colors">
                        Haz click o arrastra una imagen aquí
                     </p>
                     <p className="text-xs text-red-400/50">
                        Soporta JPG, PNG, WEBP
                     </p>
                  </div>
                  <input 
                     id="file-upload"
                     type="file" 
                     className="hidden" 
                     accept="image/*" 
                     onChange={handleFileSelect} 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-red-500 uppercase mb-1 tracking-wide">Fecha</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-black/50 border border-red-900/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-red-500 uppercase mb-1 tracking-wide">Hora</label>
              <input
                type="time"
                required
                step="1"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-black/50 border border-red-900/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 border border-red-500 uppercase tracking-wide"
            >
              <Calendar className="w-4 h-4" />
              {loading ? 'GUARDANDO...' : 'GUARDAR TIMING'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
