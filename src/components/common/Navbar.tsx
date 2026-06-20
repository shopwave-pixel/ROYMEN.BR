import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Heart, User, Shield, LogOut, Menu, X, Landmark } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, cart, wishlist, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0F111A]/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded bg-[#D4AF37] flex items-center justify-center font-display font-extrabold text-slate-950 text-xl tracking-tighter shadow-lg group-hover:scale-105 transition-transform duration-300">
              R
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-[3px] text-white block">ROY MEN</span>
              <span className="text-[9px] text-[#D4AF37] tracking-[2px] block font-mono uppercase">Wear Confidence</span>
            </div>
          </Link>

          {/* Desktop Navigation Linkages */}
          <div className="hidden md:flex items-center space-x-8 font-sans">
            <Link 
              to="/" 
              className={`text-sm tracking-widest font-medium uppercase transition-colors hover:text-[#D4AF37] ${
                isActive('/') ? 'text-[#D4AF37]' : 'text-slate-300'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className={`text-sm tracking-widest font-medium uppercase transition-colors hover:text-[#D4AF37] ${
                isActive('/shop') ? 'text-[#D4AF37]' : 'text-slate-300'
              }`}
            >
              Shop
            </Link>
            {user && (
              <Link 
                to="/orders" 
                className={`text-sm tracking-widest font-medium uppercase transition-colors hover:text-[#D4AF37] ${
                  isActive('/orders') ? 'text-[#D4AF37]' : 'text-slate-300'
                }`}
              >
                My Orders
              </Link>
            )}
          </div>

          {/* Desktop Right: Badges & Profile */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-slate-300 hover:text-[#D4AF37] transition-all">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold font-mono leading-none text-slate-950 bg-[#D4AF37] rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-slate-300 hover:text-[#D4AF37] transition-all">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold font-mono leading-none text-slate-950 bg-[#D4AF37] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin toggle if applicable */}
            {user && user.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-amber-500/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 text-xs font-semibold tracking-wider uppercase transition-all duration-300 border border-[#D4AF37]/30"
              >
                <Shield className="w-3.5 h-3.5" />
                DASHBOARD
              </Link>
            )}

            {/* User details / sign-in */}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300 group-hover:border-[#D4AF37] transition-all">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left font-sans">
                    <span className="block text-xs font-semibold text-white truncate max-w-[120px]">{user.name}</span>
                    <span className="block text-[9px] text-slate-500 font-mono capitalize">{user.role}</span>
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="px-5 py-2 text-xs font-semibold tracking-widest uppercase text-slate-950 bg-[#D4AF37] hover:bg-yellow-500 transition-all rounded"
              >
                Login
              </Link>
            )}

          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center space-x-4">
            <Link to="/wishlist" className="relative text-slate-300">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.25 text-[8px] font-bold text-slate-950 bg-[#D4AF37] rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-slate-300">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.25 text-[8px] font-bold text-slate-950 bg-[#D4AF37] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#12141C] border-b border-slate-800 animate-slideDown font-sans">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 font-semibold uppercase tracking-widest text-sm hover:text-[#D4AF37] transition-all"
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 font-semibold uppercase tracking-widest text-sm hover:text-[#D4AF37] transition-all"
            >
              Shop
            </Link>
            {user && (
              <Link 
                to="/orders" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 font-semibold uppercase tracking-widest text-sm hover:text-[#D4AF37] transition-all"
              >
                My Orders
              </Link>
            )}
            
            {user && user.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-amber-400 font-semibold text-sm hover:text-[#D4AF37] uppercase tracking-widest py-1 justify-center rounded bg-amber-500/5 border border-amber-500/20"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            <hr className="border-slate-800" />

            {user ? (
              <div className="space-y-4">
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-[#D4AF37]/30">
                    <User className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">{user.name}</span>
                    <span className="block text-xs text-slate-400">{user.email}</span>
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-rose-500/10 text-rose-450 border border-rose-500/25 hover:bg-rose-500/20 text-xs font-semibold uppercase tracking-wide transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 text-xs font-semibold tracking-widest uppercase text-slate-900 bg-[#D4AF37] hover:bg-yellow-500 transition-all rounded"
              >
                Login to Account
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
