import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Phone, Lock, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, error, loading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [validationErr, setValidationErr] = useState<string | null>(null);

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErr(null);

    if (!email.trim() || !phone.trim()) {
      setValidationErr('Please fill in both email and contact number.');
      return;
    }

    const success = await login(email, phone, role);
    if (success) {
      navigate(redirectPath, { replace: true });
    }
  };

  const autofillDemoUser = (demoType: 'customer' | 'admin') => {
    if (demoType === 'admin') {
      setEmail('admin@roymen.com');
      setPhone('+8801712994432');
      setRole('admin');
    } else {
      setEmail('customer@roymen.com');
      setPhone('+8801711223344');
      setRole('customer');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans space-y-8 my-10 bg-[#12141C] border border-slate-800 rounded-lg shadow-2xl relative">
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-[#D4AF37] text-[10px] font-mono border border-amber-500/20 uppercase tracking-widest">
        <Sparkles className="w-3 h-3" />
        Secure SSL
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white uppercase">
          Welcome to ROY MEN
        </h1>
        <p className="text-xs text-slate-400">
          Enter credentials or claim quick credentials below.
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
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Secure Contact Handle</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="tel" 
              placeholder="+880 17--"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 pl-10 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Client Role (Toggle for Simulator)</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
          >
            <option value="customer">Premium Customer Member</option>
            <option value="admin">ROY MEN Operator Director (Admin)</option>
          </select>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded transition-all shadow-md"
        >
          {loading ? 'Analyzing Credentials...' : 'Sign In securely'}
        </button>

      </form>

      {/* Auto fills panels for Sandbox previewers */}
      <div className="pt-6 border-t border-slate-850 space-y-3">
        <span className="block text-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
          ⚡ SANDBOX demo Autofills
        </span>
        
        <div className="grid grid-cols-2 gap-3 text-center">
          <button
            type="button"
            onClick={() => autofillDemoUser('customer')}
            className="p-2 border border-slate-800 bg-slate-900 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all text-xs font-semibold rounded text-slate-300"
          >
            Fill Customer Demo
          </button>
          
          <button
            type="button"
            onClick={() => autofillDemoUser('admin')}
            className="p-2 border border-slate-800 bg-slate-900 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-xs font-semibold rounded text-[#D4AF37]"
          >
            Fill Director Admin
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400 font-sans">
          Don't have an elite rank?{' '}
          <Link to="/register" className="text-[#D4AF37] hover:underline font-bold">
            Create Profile Member
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Login;
