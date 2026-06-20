import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Eye, Heart, Filter, AlertCircle } from 'lucide-react';

export const Shop: React.FC = () => {
  const { products, categories, toggleWishlist, isInWishlist, addToCart } = useApp();
  
  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  
  // Available Sizes to filter
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Size filter
    if (selectedSize !== 'all') {
      result = result.filter(p => p.sizes.includes(selectedSize));
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    }

    return result.filter(p => p.isActive);
  }, [products, selectedCategory, selectedSize, searchQuery, sortBy]);

  const handleQuickAdd = (p: typeof products[0]) => {
    addToCart(p, 1, p.sizes[0] || 'M', p.colors[0] || 'Black');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-6 text-center md:text-left space-y-2">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
          Sartorial Gallery
        </h1>
        <p className="text-xs text-slate-400">
          Refining masculine luxury with premium weaves, classic lines, and exquisite detailings.
        </p>
      </div>

      {/* Primary Toolbar: Search & Filter Options */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Sidebar Filters (desktop) */}
        <div className="lg:col-span-1 space-y-8 bg-[#12141C] border border-slate-800 p-6 rounded-lg h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Filter className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Filters</h3>
          </div>

          {/* Search box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Search Catalog</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Product, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded py-2 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-[#D4AF37] transition-all"
              />
            </div>
          </div>

          {/* Categories list */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</label>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-left text-xs font-medium py-1.5 transition-all hover:text-[#D4AF37] ${
                  selectedCategory === 'all' ? 'text-[#D4AF37] font-bold pl-2 border-l-2 border-[#D4AF37]' : 'text-slate-400'
                }`}
              >
                All Collections
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`text-left text-xs font-medium py-1.5 transition-all hover:text-[#D4AF37] ${
                    selectedCategory === cat._id ? 'text-[#D4AF37] font-bold pl-2 border-l-2 border-[#D4AF37]' : 'text-slate-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selectors */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Sizes</label>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {['all', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded border uppercase transition-all ${
                    selectedSize === size 
                      ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]' 
                      : 'border-slate-800 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters button */}
          <button 
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSize('all');
              setSearchQuery('');
              setSortBy('default');
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded uppercase tracking-wider transition-all"
          >
            Clear Filters
          </button>
        </div>

        {/* Right column: Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting / Meta Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-850">
            <p className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{filteredProducts.length}</span> premium models
            </p>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded outline-none focus:border-[#D4AF37]"
              >
                <option value="default">Release Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="views">Most Popular / Viewed</option>
              </select>
            </div>
          </div>

          {/* Grid or Empty warnings */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-[#12141C] border border-slate-800 rounded-lg text-slate-400 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-[#D4AF37] animate-pulse" />
              <div>
                <h4 className="font-display font-bold text-white text-lg mb-1">No Matching Items</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  We could not find items aligning with your search or size criteria. Check another filter or type reset.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(p => {
                const inWish = isInWishlist(p._id);
                return (
                  <div 
                    key={p._id} 
                    className="bg-[#12141C] border border-slate-800 rounded overflow-hidden shadow-lg group hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-950 shrink-0">
                      <img 
                        src={p.images[0]} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button 
                          onClick={() => toggleWishlist(p)}
                          className={`p-2 rounded-full backdrop-blur-md border hover:bg-slate-900 transition-all ${
                            inWish 
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950' 
                              : 'bg-slate-950/60 border-slate-700 text-white hover:text-[#D4AF37]'
                          }`}
                          title={inWish ? 'Remove' : 'Save'}
                        >
                          <Heart className="w-4 h-4 fill-current text-current" />
                        </button>
                      </div>

                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                          <span className="px-4 py-1.5 border border-red-500 bg-red-950/60 text-red-100 text-xs font-mono font-bold tracking-widest rounded uppercase">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title & SKU */}
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h3 className="font-display font-extrabold text-sm text-white group-hover:text-[#D4AF37] transition-all line-clamp-1">
                            {p.name}
                          </h3>
                        </div>
                        <span className="block text-[10px] font-mono text-slate-500">{p.sku}</span>
                        
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-2" title={p.description}>
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-850/60">
                        <div>
                          {p.originalPrice && (
                            <span className="block text-[10px] text-slate-500 line-through font-mono">
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
                            className="p-2.5 rounded border border-slate-800 text-slate-300 hover:text-[#D4AF37] hover:border-slate-500 transition-all bg-slate-900/40"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {p.stock > 0 && (
                            <button 
                              onClick={() => handleQuickAdd(p)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-all"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Bag</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Shop;
