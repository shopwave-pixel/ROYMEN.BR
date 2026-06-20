import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Heart, ArrowLeft, Star, Clock, Sparkles } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, toggleWishlist, isInWishlist, addToCart } = useApp();

  // Find targeted product
  const product = products.find(p => p.slug === slug);

  // States
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [mainImage, setMainImage] = useState<string>('');
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [localReviews, setLocalReviews] = useState<any[]>([]);

  // Init selections
  useEffect(() => {
    if (product) {
      if (product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors.length > 0) setSelectedColor(product.colors[0]);
      if (product.images.length > 0) setMainImage(product.images[0]);
      if (product.reviews) setLocalReviews(product.reviews);
      
      // Increment dynamic views record locally
      product.views = (product.views || 0) + 1;
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h2 className="font-display font-bold text-2xl text-white">Product Not Found</h2>
        <p className="text-xs text-slate-400">The product you are trying to view does not exist in our system catalog.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-[#D4AF37] text-slate-950 font-bold uppercase tracking-wider text-xs rounded">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);

  const handleAddBag = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    // Redirect to cart
    navigate('/cart');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newRev = {
      user: `usr-${Math.random()}`,
      name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLocalReviews(prev => [newRev, ...prev]);
    setReviewName('');
    setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans space-y-12">
      
      {/* Breadcrumbs / Back navigation */}
      <div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs text-[#D4AF37] hover:text-white transition-all font-medium uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog Gallery</span>
        </Link>
      </div>

      {/* Grid: Images + Selections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Premium Images Block */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <img 
              src={mainImage || product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 rounded overflow-hidden border transition-all ${
                    mainImage === img ? 'border-[#D4AF37]' : 'border-slate-800 hover:border-slate-500'
                  }`}
                >
                  <img src={img} alt="Tumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Custom Selections configuration */}
        <div className="space-y-6">
          
          {/* Main Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-mono tracking-wider text-[#D4AF37] uppercase">{product.sku}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wide">
              {product.name}
            </h1>
            
            {/* Stats: Views and Reviews quantity */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="text-slate-300 font-bold">{product.rating || '5.0'}</span>
              </div>
              <span>•</span>
              <span>{product.views || 0} active views</span>
              <span>•</span>
              <span>{localReviews.length} client reviews</span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-sans border-t border-slate-850 pt-4">
            {product.description}
          </p>

          {/* Price display block */}
          <div className="py-4 bg-[#12141C] border border-slate-800 rounded px-6 flex items-center justify-between font-mono">
            <div>
              <span className="block text-xs text-[#D4AF37] tracking-wider uppercase font-sans mb-1">Authentic Pricing</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-white">
                  {product.price.toLocaleString()} BDT
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    {product.originalPrice.toLocaleString()} BDT
                  </span>
                )}
              </div>
            </div>
            
            {product.stock > 0 ? (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                ✔ {product.stock} left in stock
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded">
                ⚠ Sold Out
              </span>
            )}
          </div>

          {/* Sizes picker */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Select Size</span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border uppercase font-bold transition-all rounded ${
                    selectedSize === size 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950 shadow' 
                      : 'border-slate-800 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors picker */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Select Color Accent</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border font-medium transition-all rounded ${
                    selectedColor === color 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950 font-bold shadow' 
                      : 'border-slate-800 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity selector and checkout add button */}
          <div className="pt-6 border-t border-slate-850 flex items-center gap-4">
            {product.stock > 0 ? (
              <>
                <div className="flex items-center border border-slate-800 rounded bg-slate-900 font-mono text-sm overflow-hidden h-12 shrink-0">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 hover:bg-slate-800 text-slate-400 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-white text-center w-12">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3 hover:bg-slate-800 text-slate-400 font-bold"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleAddBag}
                  className="flex-1 h-12 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 text-xs font-bold uppercase tracking-widest transition-all rounded flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Reserve & Bag Styles</span>
                </button>
              </>
            ) : (
              <button 
                disabled
                className="w-full h-12 bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest rounded"
              >
                Temporarily Sold Out
              </button>
            )}

            <button 
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 border rounded-lg transition-all ${
                isSaved 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

        </div>

      </div>

      {/* Reviews/Testimonials Block */}
      <div className="border-t border-slate-800 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Leave Client Statement</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4 bg-[#12141C] p-6 border border-slate-800 rounded-lg">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Client Name</label>
              <input 
                type="text" 
                placeholder="Ex. Anwar Sadat"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Rating Tier</label>
              <select 
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars Good)</option>
                <option value={3}>⭐⭐⭐ (3 Stars Satisfactory)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Comfort Feedback / Statement</label>
              <textarea 
                placeholder="Detail structure, material feel, fit accuracy, and look aesthetic..."
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded transition-all"
            >
              Post Experience
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Heritage Feedbacks ({localReviews.length})</h3>
          
          {localReviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No historical client reviews have been logged on this particular design output. Be the pioneer.</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-custom">
              {localReviews.map((rev, idx) => (
                <div key={idx} className="p-4 bg-slate-900/60 border border-slate-850 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{rev.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rev.createdAt}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(rev.rating) 
                            ? 'fill-amber-400 text-amber-500' 
                            : 'text-slate-700'
                        }`} 
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductDetails;
