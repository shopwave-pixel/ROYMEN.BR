import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, Plus, Search, Trash2, Edit3, Filter, 
  ChevronRight, AlertCircle, ShoppingBag, Eye, RefreshCw 
} from 'lucide-react';
import { Product } from '../../types';

export const ProductsManagement: React.FC = () => {
  const { 
    products, categories, addProduct, updateProduct, deleteProduct, loading 
  } = useApp();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low' | 'ok'>('all');

  // Modal Control
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State - Add/Edit Product
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(3500);
  const [prodDiscountPrice, setProdDiscountPrice] = useState<number>(3500);
  const [prodStock, setProdStock] = useState<number>(15);
  const [prodCat, setProdCat] = useState('');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80');
  const [prodDesc, setProdDesc] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Obsidian Black', 'Classic Navy']);

  // Options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Fitted'];
  const colorOptions = [
    'Obsidian Black', 'Midnight Blue', 'Classic Navy', 
    'Emerald Green', 'Royal Maroon', 'Crimson Red', 
    'Charcoal Gray', 'Pure White', 'Golden Sand'
  ];

  const handleOpenCreate = () => {
    setProdName('');
    setProdSku('');
    setProdPrice(3500);
    setProdDiscountPrice(3500);
    setProdStock(15);
    setProdCat(categories[0]?._id || '');
    setProdImage('https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80');
    setProdDesc('Custom engineered luxury tailored model with rich detail craftsmanship.');
    setSelectedSizes(['M', 'L', 'XL']);
    setSelectedColors(['Obsidian Black', 'Classic Navy']);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdSku(prod.sku || '');
    setProdPrice(prod.price);
    setProdDiscountPrice(prod.originalPrice || prod.price);
    setProdStock(prod.stock);
    setProdCat(prod.category);
    setProdImage(prod.images[0] || '');
    setProdDesc(prod.description);
    setSelectedSizes(prod.sizes || []);
    setSelectedColors(prod.colors || []);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSku || !prodCat) {
      alert('Mandatory catalogue parameters are absent.');
      return;
    }

    try {
      await addProduct({
        name: prodName,
        slug: prodName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        sku: prodSku.toUpperCase(),
        description: prodDesc,
        price: Number(prodPrice),
        originalPrice: Number(prodDiscountPrice) || undefined,
        stock: Number(prodStock),
        images: [prodImage],
        sizes: selectedSizes,
        colors: selectedColors,
        category: prodCat,
        isActive: true
      });
      setIsCreateOpen(false);
      alert('Product created.');
    } catch (err: any) {
      alert(err.message || 'Error creating product.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !prodName || !prodSku) return;

    try {
      await updateProduct({
        ...editingProduct,
        name: prodName,
        slug: prodName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        sku: prodSku.toUpperCase(),
        description: prodDesc,
        price: Number(prodPrice),
        originalPrice: Number(prodDiscountPrice) || undefined,
        stock: Number(prodStock),
        images: [prodImage],
        sizes: selectedSizes,
        colors: selectedColors,
        category: prodCat
      });
      setEditingProduct(null);
      alert('Product updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Error updating product.');
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      const matchesSearch = 
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'out') {
        matchesStock = prod.stock === 0;
      } else if (stockFilter === 'low') {
        matchesStock = prod.stock > 0 && prod.stock < 5;
      } else if (stockFilter === 'ok') {
        matchesStock = prod.stock >= 5;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  const getCategoryName = (catId: string) => {
    const found = categories.find(c => c._id === catId);
    return found ? found.name : 'Unassigned';
  };

  return (
    <div className="font-sans space-y-8 pb-16">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase flex items-center gap-3">
            <Package className="w-7 h-7 text-[#D4AF37]" />
            Products Catalog
          </h1>
          <p className="text-xs text-slate-450 mt-1">Audit active outfit models, adjust pricing valuations, update stocks, and manage sizes.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all shadow"
        >
          <Plus className="w-4 h-4" />
          Create New Outfit Model
        </button>
      </div>

      {/* Filter and Queries panel */}
      <div className="bg-[#121522] border border-slate-850 p-5 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search SKUs, product model designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Filter Category */}
        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Style Groups</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Filter Stock */}
        <div className="md:col-span-3">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Inventory status</option>
            <option value="out">Out of stock (0)</option>
            <option value="low">Low allocation (1-4)</option>
            <option value="ok">Well stocked (5+)</option>
          </select>
        </div>

      </div>

      {/* Catalog Table */}
      <div className="border border-slate-850 rounded-lg overflow-hidden bg-[#121522]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161a29]/80 text-slate-400 font-bold border-b border-slate-800 selection:none">
              <tr>
                <th className="p-4">Design Item</th>
                <th className="p-4">SKU identifier</th>
                <th className="p-4">Taxonomy Category</th>
                <th className="p-4">Pricing</th>
                <th className="p-4 text-center">Available Stock</th>
                <th className="p-4">Tag variants</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-550 italic">
                    {loading ? (
                      <div className="flex justify-center items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        Fetching models catalog...
                      </div>
                    ) : 'No design products found matching your filter selections.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => (
                  <tr key={prod._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                          <img 
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80'} 
                            alt={prod.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-white text-xs hover:text-[#D4AF37] transition-all cursor-pointer">{prod.name}</div>
                          <p className="text-[10px] text-slate-500 hover:text-slate-400 font-mono mt-0.5 pointer-events-none truncate">{prod._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#D4AF37] tracking-wider">
                      {prod.sku || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] text-slate-350 font-medium">
                        {getCategoryName(prod.category)}
                      </span>
                    </td>
                    <td className="p-4 font-mono space-y-0.5">
                      <div className="text-white font-bold">{prod.price.toLocaleString()} BDT</div>
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <div className="text-[10px] text-slate-550 line-through font-medium">
                          {prod.originalPrice.toLocaleString()} BDT
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {prod.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/15 font-black font-mono">
                          OUT OF STOCK
                        </span>
                      ) : prod.stock < 5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold font-mono">
                          LOW ({prod.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">
                          {prod.stock} PCS
                        </span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {prod.sizes?.map(size => (
                          <span key={size} className="bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 px-1.5 py-0.2 rounded font-mono">
                            {size}
                          </span>
                        ))}
                      </div>
                      <div className="truncate text-[10px] text-slate-500 font-medium italic">
                        {prod.colors?.join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-all text-xs"
                        title="Edit design configurations"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you absolutely sure you want to delete this design listing forever? This cannot be undone.')) {
                            deleteProduct(prod._id);
                          }
                        }}
                        className="p-1.5 rounded bg-rose-500/10 text-rose-450 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-xs"
                        title="Permanently remove SKU"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PRODUCT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#12141C] border border-slate-850 rounded-lg shadow-2xl p-6 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Plus className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <h3 className="font-display font-medium text-sm text-white uppercase tracking-wider">Create Couture Apparel SKU</h3>
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest font-semibold">Couture Inventory Injection</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apparel Model naming</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Classic Velvet Royal Tuxedo"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. ROY-VT-109"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxonomy style classification</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price valuation (BDT)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original / Discount tag reference (BDT)</label>
                  <input
                    type="number"
                    required
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Stock units allocation</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary asset Image catalog URL</label>
                  <input
                    type="url"
                    required
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>
              </div>

              {/* Sizes Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Style Sizes allocation</label>
                <div className="flex flex-wrap gap-2.5">
                  {sizeOptions.map(sz => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded text-[11px] font-bold font-mono transition-all border ${
                        selectedSizes.includes(sz)
                          ? 'bg-[#D4AF37] text-slate-950 border-transparent shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Style Colors list</label>
                <div className="flex flex-wrap gap-2.5">
                  {colorOptions.map(col => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => toggleColor(col)}
                      className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border ${
                        selectedColors.includes(col)
                          ? 'bg-[#D4AF37] text-slate-950 border-transparent shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail description and tailoring notes</label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="border-t border-slate-800/60 pt-4 flex justify-end gap-3 text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded transition-all"
                >
                  Close panel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 rounded transition-all shadow"
                >
                  Confirm Injection
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#12141C] border border-slate-850 rounded-lg shadow-2xl p-6 my-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Edit3 className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <h3 className="font-display font-medium text-sm text-white uppercase tracking-wider">Update Outfit configurations</h3>
                <p className="text-[10px] text-slate-550 font-mono">SKU REF: {editingProduct.sku || editingProduct._id}</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apparel Model rename</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU Inventory identifier</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxonomy Style Category</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price valuation (BDT)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount tag reference (BDT)</label>
                  <input
                    type="number"
                    required
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock inventory volume</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset catalog image link</label>
                  <input
                    type="url"
                    required
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>
              </div>

              {/* Sizes Picker */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size metrics allocation</label>
                <div className="flex flex-wrap gap-2.5">
                  {sizeOptions.map(sz => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded text-[11px] font-bold font-mono transition-all border ${
                        selectedSizes.includes(sz)
                          ? 'bg-[#D4AF37] text-slate-950 border-transparent shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Picker */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variant styling shades</label>
                <div className="flex flex-wrap gap-2.5">
                  {colorOptions.map(col => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => toggleColor(col)}
                      className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border ${
                        selectedColors.includes(col)
                          ? 'bg-[#D4AF37] text-slate-950 border-transparent shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Styling description notes</label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800/60 pt-4 flex justify-end gap-3 text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded transition-all"
                >
                  Discard editorial
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 rounded transition-all shadow"
                >
                  Save configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsManagement;
