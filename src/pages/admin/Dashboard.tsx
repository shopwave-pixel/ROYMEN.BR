import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, ShoppingCart, Users, Package, ShieldCheck, 
  Trash2, AlertTriangle, CheckCircle2, ChevronRight, ListOrdered, 
  Layers, BarChart2, ShieldAlert, KeyRound, Info, Calendar 
} from 'lucide-react';
import { Order, Product } from '../../types';

export const Dashboard: React.FC = () => {
  const { 
    orders, products, getDashboardStats, updateOrderStatus 
  } = useApp();

  const stats = getDashboardStats();
  const navigate = useNavigate();

  // Filter 5 most recent pending orders
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);
  }, [orders]);

  // Filter low stock allocations
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock < 5).slice(0, 5);
  }, [products]);

  const handleSetOrderStatus = async (id: string, status: Order['orderStatus']) => {
    try {
      await updateOrderStatus(id, status);
      alert('Order status has been updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Error updating order status.');
    }
  };

  const getOrderStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Confirmed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Processing': return 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
    }
  };

  return (
    <div className="font-sans space-y-10 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">Executive Console</h1>
        <p className="text-xs text-slate-450 mt-1">Unified administration suite for monitoring orders, catalogs, databases, and general ledger reports.</p>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Gross Revenue */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-28 h-28 bg-[#D4AF37]/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.totalRevenue.toLocaleString()} <span className="text-xs">BDT</span>
          </div>
          <span className="text-[10px] text-emerald-450 block font-mono">Consolidated earnings</span>
        </div>

        {/* Garbage/Garment Orders */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-28 h-28 bg-blue-500/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Invoice Volume</span>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.totalOrders}
          </div>
          <span className="text-[10px] text-amber-500 block font-mono font-semibold">
            {stats.pendingVolume} awaiting processing
          </span>
        </div>

        {/* Registries */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-28 h-28 bg-purple-500/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Active Customers</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.totalUsers}
          </div>
          <span className="text-[10px] text-purple-450 block font-mono">Sandbox registry synced</span>
        </div>

        {/* Total SKUs */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-28 h-28 bg-emerald-500/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Catalogue SKUs</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.totalProducts}
          </div>
          <span className="text-[10px] text-emerald-400 block font-mono">All design models active</span>
        </div>

      </div>

      {/* QUICK SUBMODULE ROUTING MATRIX */}
      <div className="space-y-3">
        <h3 className="font-display font-medium text-xs text-white uppercase tracking-wider block">Operational Routing shortcuts</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-5 bg-slate-900 hover:bg-[#121522]/80 border border-slate-800 hover:border-[#D4AF37]/50 rounded-lg text-left transition-all space-y-4 group"
          >
            <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg w-10 h-10 flex items-center justify-center transition-all group-hover:scale-105">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                Orders & Ledgers
                <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
              </div>
              <span className="text-[10px] text-slate-500 block font-medium mt-1 font-sans">Audit cash & mobile bags</span>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/products')}
            className="p-5 bg-slate-900 hover:bg-[#121522]/80 border border-slate-800 hover:border-[#D4AF37]/50 rounded-lg text-left transition-all space-y-4 group"
          >
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg w-10 h-10 flex items-center justify-center transition-all group-hover:scale-105">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                Products Catalog
                <ChevronRight className="w-3.5 h-3.5 text-blue-400 transition-transform group-hover:translate-x-1" />
              </div>
              <span className="text-[10px] text-slate-500 block font-medium mt-1 font-sans">Update SKUs, pricing & stock</span>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/categories')}
            className="p-5 bg-slate-900 hover:bg-[#121522]/80 border border-slate-800 hover:border-[#D4AF37]/50 rounded-lg text-left transition-all space-y-4 group"
          >
            <div className="p-2.5 bg-emerald-500/10 text-emerald-450 rounded-lg w-10 h-10 flex items-center justify-center transition-all group-hover:scale-105">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                Styles taxonomy
                <ChevronRight className="w-3.5 h-3.5 text-emerald-450 transition-transform group-hover:translate-x-1" />
              </div>
              <span className="text-[10px] text-slate-500 block font-medium mt-1 font-sans">Modify menus list</span>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/users')}
            className="p-5 bg-slate-900 hover:bg-[#121522]/80 border border-slate-800 hover:border-[#D4AF37]/50 rounded-lg text-left transition-all space-y-4 group"
          >
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg w-10 h-10 flex items-center justify-center transition-all group-hover:scale-105">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                Users Registry
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 transition-transform group-hover:translate-x-1" />
              </div>
              <span className="text-[10px] text-slate-500 block font-medium mt-1 font-sans">Monitor access authorities</span>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/analytics')}
            className="p-5 bg-slate-900 hover:bg-[#121522]/80 border border-slate-800 hover:border-[#D4AF37]/50 rounded-lg text-left transition-all space-y-4 group"
          >
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg w-10 h-10 flex items-center justify-center transition-all group-hover:scale-105">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                Charts Report
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 transition-transform group-hover:translate-x-1" />
              </div>
              <span className="text-[10px] text-slate-500 block font-medium mt-1 font-sans">Deep business analytics</span>
            </div>
          </button>

        </div>
      </div>

      {/* RECENT PENDING INVOICES & INVENTORY ALERTS METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Latest 5 orders list */}
        <div className="lg:col-span-8 bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-805 pb-3">
            <h3 className="font-display font-medium text-xs text-white uppercase tracking-wider">Recent Orders Flow awaiting Audit</h3>
            <Link to="/admin/orders" className="text-[10px] text-[#D4AF37] font-semibold uppercase hover:underline">Manage All orders &rarr;</Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No order histories drafted in the system sandbox.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 font-bold border-b border-slate-805">
                  <tr>
                    <th className="pb-3 text-[10px] uppercase">Ref ID</th>
                    <th className="pb-3 text-[10px] uppercase">Phone</th>
                    <th className="pb-3 text-[10px] uppercase">Channel</th>
                    <th className="pb-3 text-right text-[10px] uppercase text-slate-400">Total</th>
                    <th className="pb-3 text-center text-[10px] uppercase">Status</th>
                    <th className="pb-3 text-right text-[10px] uppercase">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {recentOrders.map(order => (
                    <tr key={order._id} className="hover:bg-slate-900/20">
                      <td className="py-3 font-mono text-white text-[11px] font-bold">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="py-3 text-slate-405 font-mono text-[11px]">{order.phone}</td>
                      <td className="py-3 font-mono font-bold text-[#D4AF37] text-[11px]">{order.paymentMethod}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-300">{order.totalPrice.toLocaleString()} BDT</td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${getOrderStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleSetOrderStatus(order._id, e.target.value as any)}
                          className="bg-slate-905 border border-slate-800 text-[10px] text-slate-400 font-bold outline-none rounded p-1 max-w-[120px]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirm</option>
                          <option value="Processing">Process</option>
                          <option value="Shipped">Ship</option>
                          <option value="Delivered">Deliver</option>
                          <option value="Cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inventory low stock alerts column */}
        <div className="lg:col-span-4 bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-805 pb-3 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-display font-medium text-xs uppercase tracking-wider">Critical Stock Alerts ({lowStockProducts.length})</h3>
          </div>

          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 bg-emerald-500/5 rounded border border-emerald-500/10 text-center text-xs text-emerald-450 font-medium">
                All models are well-allocated above safety levels.
              </div>
            ) : (
              lowStockProducts.map(prod => (
                <div key={prod._id} className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-850 text-xs">
                  <div className="truncate max-w-[170px]">
                    <div className="font-bold text-slate-200 truncate">{prod.name}</div>
                    <span className="text-[10px] text-[#D4AF37] font-bold font-mono tracking-wider">{prod.sku}</span>
                  </div>

                  <div className="text-right">
                    {prod.stock === 0 ? (
                      <span className="text-rose-450 font-black font-mono text-[10px] block">OUT OF STOCK</span>
                    ) : (
                      <span className="text-amber-400 font-bold font-mono text-[10px] block">CRITICAL ({prod.stock} left)</span>
                    )}
                    <Link to="/admin/products" className="text-[9px] text-blue-400 font-bold uppercase hover:underline mt-0.5 block">Refill &rarr;</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
