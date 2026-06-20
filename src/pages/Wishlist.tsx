import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  const handleQuickAdd = (p: typeof wishlist[0]) => {
    addToCart(p, 1, p.sizes[0] || 'M', p.colors[0] || 'Black');
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-905 flex items-center justify-center mx-auto text-slate-700">
          <Heart className="w-8 h-8 text-slate-600" />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-white mb-2">Saved Outfits empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            As you browse, tap the heart button to save premium designer garments here on your personalized styling board.
          </p>
        </div>
        <Link to="/shop" className="inline-block px-6 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-wider text-xs rounded transition-all">
          Browse Tailoring Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans space-y-12">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 text-center md:text-left">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">Your Saved Looks</h1>
        <p className="text-xs text-slate-400">Exclusive collections reserved on your design board.</p>
      </div>

      {/* Grid of wishlist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {wishlist.map(p => (
          <div 
            key={p._id}
            className="bg-[#12141C] border border-slate-800 rounded overflow-hidden shadow-lg group hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-950 shrink-0">
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              
              <div className="absolute top-4 right-4 animate-fadeIn">
                <button 
                  onClick={() => toggleWishlist(p)}
                  className="p-2 rounded-full bg-[#D4AF37] text-slate-950 hover:bg-yellow-500 transition-all border border-[#D4AF37]"
                  title="Remove"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-white line-clamp-1 group-hover:text-[#D4AF37] transition-colors">{p.name}</h3>
                <span className="block text-[10px] font-mono text-slate-500 mt-0.5">{p.sku}</span>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-2">{p.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-850">
                <span className="text-sm font-extrabold text-white font-mono">{p.price.toLocaleString()} BDT</span>
                
                <div className="flex gap-2">
                  <Link 
                    to={`/product/${p.slug}`}
                    className="p-2.5 rounded border border-slate-800 text-slate-300 hover:text-[#D4AF37] hover:border-slate-500 transition-all bg-slate-900/40"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  {p.stock > 0 && (
                    <button 
                      onClick={() => handleQuickAdd(p)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Bag</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
