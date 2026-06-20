import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Shield, Home, ShoppingBag, ListOrdered, Landmark, LogOut, ArrowLeft, 
  Users, Package, Layers, BarChart2 
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0A0C14] text-slate-100 flex flex-col font-sans">
      
      {/* Admin Top Dashboard Bar */}
      <header className="bg-[#121522] border-b border-slate-800 h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all" title="Return to Storefront">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-display font-black text-sm tracking-[2px] uppercase">ROY MEN ADMIN CONTROL</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:block text-slate-400">
            Current Operator: <span className="text-white font-bold">{user?.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold uppercase hover:bg-rose-500 hover:text-white transition-all duration-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Dashboard
          </button>
        </div>
      </header>

      {/* Main Grid: Sidebar + Sub Content */}
      <div className="flex-1 flex flex-col md:flex-row h-full">
        
        {/* Admin Navigation Sidebar Options */}
        <aside className="w-full md:w-64 bg-[#121522] border-b md:border-b-0 md:border-r border-slate-800 p-4 shrink-0 font-sans">
          <nav className="space-y-1.5">
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isLinkActive('/admin/dashboard') 
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Console Overview</span>
            </Link>

            <Link 
              to="/admin/orders" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isLinkActive('/admin/orders') 
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Orders & Ledgers</span>
            </Link>

            <Link 
              to="/admin/products" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isLinkActive('/admin/products') 
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
            </Link>

            <Link 
              to="/admin/categories" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isLinkActive('/admin/categories') 
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Styles Taxonomy</span>
            </Link>

            <Link 
              to="/admin/users" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isLinkActive('/admin/users') 
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Registry</span>
            </Link>

            <Link 
              to="/admin/analytics" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isLinkActive('/admin/analytics') 
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Charts Reports</span>
            </Link>
          </nav>
          
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 space-y-4">
            <p>📋 <span className="text-amber-400 font-semibold uppercase">Admin Guidelines</span>: Audit bKash manual transaction ID tokens carefully against active SMS ledgers before checking as PAID.</p>
          </div>
        </aside>

        {/* Content Render Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
