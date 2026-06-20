import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, CheckCircle, ShieldAlert } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const ok = await updateProfile(name, phone);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans space-y-12">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">Your Profile</h1>
        <p className="text-xs text-slate-400">Edit credential coordinates and profile identifiers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left hand details display */}
        <div className="col-span-12 md:col-span-4 bg-[#12141C] border border-slate-850 p-6 rounded-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] mx-auto border border-[#D4AF37]/35">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">{user?.name}</h3>
            <span className="text-[10px] text-[#D4AF37] tracking-widest font-mono uppercase bg-[#D4AF37]/5 px-2.5 py-1 rounded-full border border-[#D4AF37]/20 block w-fit mx-auto mt-2">
              {user?.role} MEMBER
            </span>
          </div>

          <hr className="border-slate-800/80" />

          <div className="text-left text-xs text-slate-400 space-y-2">
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono">Verified Email</span>
              <span className="text-white font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono">Secure Mobile Call</span>
              <span className="text-white font-mono">{user?.phone}</span>
            </div>
          </div>
        </div>

        {/* Right hand forms update */}
        <form onSubmit={handleUpdate} className="col-span-12 md:col-span-8 bg-[#12141C] border border-slate-850 p-6 rounded-lg space-y-6">
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Configure Parameters</h3>

          {saveSuccess && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 text-emerald-100 rounded text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Profile parameters saved successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Update Public Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Update Call Phone</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-wider text-xs rounded transition-all"
            >
              Save Parameters
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};

export default Profile;
