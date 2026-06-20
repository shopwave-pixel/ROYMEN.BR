import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Phone, User, Landmark, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, error, loading } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [validationErr, setValidationErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErr(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setValidationErr('Please fill in all requested fields completely.');
      return;
    }

    const success = await register(name, email, phone, role);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans space-y-8 my-10 bg-[#12141C] border border-slate-800 rounded-lg shadow-2xl relative">
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-[#D4AF37] text-[10px] font-mono border border-amber-500/20 uppercase tracking-widest">
        <Landmark className="w-3.5 h-3.5" />
        Member SSL
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-black text-2xl tracking-tight text-white uppercase">
          Create Member Profile
        </h1>
        <p className="text-xs text-slate-400">
          Claim key privileges, saved boards & historical tracking ranks.
        </p>
      </div>

      {(error || validationErr) && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/20 text-rose-100 rounded text-xs leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{validationErr || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Your Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Ex. Anwar Sadat"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 pl-10 text-xs text-white outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="email" 
              placeholder="concierge@roymen.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 pl-10 text-xs text-white outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Contact Phone Handle</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="tel" 
              placeholder="Ex. +8801712994432"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 pl-10 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Privilege Rank Tier</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
          >
            <option value="customer">Standard Premium Customer Member</option>
            <option value="admin">System Admin Representative</option>
          </select>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded transition-all shadow-md"
        >
          {loading ? 'Compiling Credentials...' : 'Register Profile'}
        </button>

      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400 font-sans">
          Already registered?{' '}
          <Link to="/login" className="text-[#D4AF37] hover:underline font-bold">
            Sign In Instead
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Register;
