import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Eye, Heart, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const { products, toggleWishlist, isInWishlist, addToCart } = useApp();

  // Get active featured items (first 3 active items)
  const featuredProducts = products.filter(p => p.isActive).slice(0, 3);

  const handleQuickAdd = (p: typeof products[0]) => {
    addToCart(p, 1, p.sizes[0] || 'M', p.colors[0] || 'Black');
  };

  return (
    <div className="space-y-20 pb-20 font-sans">
      
      {/* 1. Grand Hero Showcase Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#070911] overflow-hidden">
        {/* Ambient Backgounds */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80")' }}></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0F111A] via-[#0F111A]/90 to-transparent"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-left py-12">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-xs font-mono font-bold uppercase tracking-[4px] text-[#D4AF37]">
                Sartorial Perfection
              </span>
            </div>
            
            <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white leading-tight">
              Wear <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-500">Confidence</span>, Define Presence.
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              ROY MEN introduces tailored perfection. Explore authentic materials, precise cuts, and heritage designs refined for premium festive elegance and stately boardroom stature.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/shop" 
                className="px-8 py-4 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold tracking-widest uppercase text-xs transition-all rounded shadow-lg text-center"
              >
                Explore Collections
              </Link>
              <Link 
                to="/shop" 
                className="px-8 py-4 border border-slate-700 hover:border-white text-white font-bold tracking-widest uppercase text-xs transition-all rounded text-center bg-white/5 backdrop-blur"
              >
                Traditional Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Pitch Bento Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 bg-[#12141C] border border-slate-800 rounded-lg hover:border-[#D4AF37]/35 transition-all duration-300 space-y-4 shadow-md group">
            <div className="w-12 h-12 rounded bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]" id="bento-quality">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Savile Row Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every pattern line is micro-molded around athletic silhouettes using authentic high-micron wools and long-staple cotton guarantees.
            </p>
          </div>

          <div className="p-8 bg-[#12141C] border border-slate-800 rounded-lg hover:border-[#D4AF37]/35 transition-all duration-300 space-y-4 shadow-md group">
            <div className="w-12 h-12 rounded bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]" id="bento-delivery">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">48hr Dhaka Handover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immediate order placement reserves inventory completely. Packages are packed with signature double-box frames and delivered straight to details.
            </p>
          </div>

          <div className="p-8 bg-[#12141C] border border-slate-800 rounded-lg hover:border-[#D4AF37]/35 transition-all duration-300 space-y-4 shadow-md group">
            <div className="w-12 h-12 rounded bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]" id="bento-exclusivity">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Strict Limited Editions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We focus on rare design outputs rather than fast-fashion volume. Once our velvet fabric runs out, the specific product models are locked.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Featured Premium Catalogue Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-[#D4AF37] tracking-[3px] font-bold block uppercase mb-1">
              CONCIERGE PICKS
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Sartorial Masterpieces
            </h2>
          </div>
          <Link 
            to="/shop" 
            className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:text-white transition-all group"
            id="view-all-featured"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Dynamic products list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map(p => {
            const inWish = isInWishlist(p._id);
            return (
              <div 
                key={p._id} 
                className="bg-[#12141C] border border-slate-800 rounded overflow-hidden shadow-lg group hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product image with overlays */}
                <div className="relative aspect-square overflow-hidden bg-slate-950 shrink-0">
                  <img 
                    src={p.images[0]} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {p.originalPrice && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37] text-slate-950 uppercase border border-[#D4AF37]">
                        SAVE {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={() => toggleWishlist(p)}
                      className={`p-2 rounded-full backdrop-blur-md border hover:bg-slate-900 transition-all ${
                        inWish 
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950' 
                          : 'bg-slate-950/60 border-slate-700 text-white hover:text-[#D4AF37]'
                      }`}
                      title={inWish ? 'Remove from Saved' : 'Save to Board'}
                    >
                      <Heart className="w-4 h-4 fill-current text-current" />
                    </button>
                  </div>
                </div>

                {/* Details info */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-white group-hover:text-[#D4AF37] transition-all line-clamp-1 mb-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {p.originalPrice && (
                        <span className="block text-xs text-slate-500 line-through font-mono">
                          {p.originalPrice.toLocaleString()} BDT
                        </span>
                      )}
                      <span className="block text-sm font-extrabold text-white font-mono">
                        {p.price.toLocaleString()} BDT
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/product/${p.slug}`}
                        className="p-2.5 rounded border border-slate-700 text-slate-300 hover:text-[#D4AF37] hover:border-slate-500 transition-all bg-slate-900/40"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleQuickAdd(p)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-all"
                        title="Add to Shopping Bag"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Bag</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Luxury Fabric Promo block */}
      <section className="bg-gradient-to-r from-slate-950 via-[#12141C] to-slate-950 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-[10px] font-mono font-bold tracking-[3px] text-[#D4AF37]">
                ARTISANAL STITCHWORK
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
                Finely Fabricated For Royalty
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We believe clothing is armor. Every jacket structural lining, traditional Panjabi custom placket, and trouser fit run through three levels of inspection in our Dhaka workshop before it receives the master gold-stamped tag of authenticity.
              </p>
              
              <ul className="grid grid-cols-2 gap-4 text-xs font-semibold text-white">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                  <span>Handcrafted Velvet Finish</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                  <span>Authentic Egyptian Cotton</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                  <span>Interfaced Lapel Hold</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                  <span>Signature Gold Piping</span>
                </li>
              </ul>
            </div>

            <div className="aspect-[4/3] rounded overflow-hidden shadow-2xl relative border border-slate-850">
              <img 
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80" 
                alt="Artisanal Workshop styling" 
                className="w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#D4AF37]/5 mix-blend-color"></div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
