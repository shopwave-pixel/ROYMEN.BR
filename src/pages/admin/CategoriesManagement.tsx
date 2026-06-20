import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { 
  FolderPlus, Layers, Search, Trash2, Edit3, 
  RefreshCw, CheckCircle2, ChevronRight, Hash, Files
} from 'lucide-react';

export const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Creation State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Editing State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Loader
  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCategories(false);
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load category index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) {
      alert('Please fill in a valid Category Name.');
      return;
    }

    try {
      setLoading(true);
      const created = await productService.createCategory({
        name: newCatName,
        description: newCatDesc || 'Exclusive premium apparel collection.'
      });

      setCategories(prev => [...prev, created]);
      setNewCatName('');
      setNewCatDesc('');
      alert('New style category added successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName) return;

    try {
      setLoading(true);
      const updated = await productService.updateCategory(editingCategory._id, {
        name: editCatName,
        description: editCatDesc
      });

      setCategories(prev => prev.map(cat => cat._id === updated._id ? updated : cat));
      setEditingCategory(null);
      alert('Styles category updated.');
    } catch (err: any) {
      alert(err.message || 'Failed to update category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this category? This might orphan products assigned to it.')) {
      return;
    }

    try {
      setLoading(true);
      const success = await productService.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(cat => cat._id !== id));
        alert('Category deleted from taxonomy.');
      } else {
        alert('Could not complete deletion request.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove category.');
    } finally {
      setLoading(false);
    }
  };

  const selectForEditing = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
  };

  // Filter categories list
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="font-sans space-y-10 pb-16">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase flex items-center gap-3">
            <Layers className="w-7 h-7 text-[#D4AF37]" />
            Categories Taxonomy
          </h1>
          <p className="text-xs text-slate-450 mt-1">Refine taxonomy classifiers, register product clusters, and govern store menus.</p>
        </div>
        <button
          onClick={loadCategories}
          disabled={loading}
          className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 transition-all"
          title="Reload Category Index"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
        </button>
      </div>

      {/* Main Grid: Add Class Form + List table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CREATE CATEGORY BLOCK */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-6">
            <div className="border-b border-slate-805 pb-3">
              <h3 className="font-display font-medium text-sm text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                Add New Category
              </h3>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Category Title</label>
                <input 
                  type="text" 
                  placeholder="Ex. Traditional Panjabi"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Detailing Description</label>
                <textarea 
                  rows={4}
                  placeholder="Ex. Royal heritage threads masterfully handcrafted..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-wider text-xs rounded transition-all shadow"
              >
                {loading ? 'Processing...' : 'Create Styles Category'}
              </button>
            </form>
          </div>
        </div>

        {/* LIST TABLE SECTION */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search Box */}
          <div className="bg-[#121522] border border-slate-850 p-4 rounded-lg flex items-center relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-7 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search categorisations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Table */}
          <div className="border border-slate-850 rounded-lg overflow-hidden bg-[#121522]">
            {loading && categories.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-mono flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                Initializing system category mapping indexes...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 italic">
                No taxonomy entries matched your active filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161a29]/80 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-4">Taxonomy Group</th>
                      <th className="p-4">Details</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredCategories.map(cat => (
                      <tr key={cat._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 space-y-1 grid-cols-1 select-none">
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {cat.name}
                          </div>
                          <span className="text-[10px] text-[#D4AF37]/80 font-mono bg-slate-900 rounded p-1 inline-flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5" />
                            {cat.slug}
                          </span>
                        </td>
                        <td className="p-4 text-slate-350 max-w-xs truncate" title={cat.description}>
                          {cat.description || 'Premium styling designs collection.'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => selectForEditing(cat)}
                            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all inline-block border border-slate-800"
                            title="Edit this model"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all inline-block"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* EDIT MODAL OVERLAY */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#12141C] border border-slate-800 rounded-lg shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-[#D4AF37]/10 rounded text-[#D4AF37]">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-medium text-sm text-white uppercase tracking-wider">
                  Update style category
                </h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  REF ID: {editingCategory._id}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Category name</label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Detail description</label>
                <textarea
                  rows={4}
                  required
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3 text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded transition-all"
                >
                  Discard changes
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 rounded transition-all shadow"
                >
                  Save styles configuration
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesManagement;
