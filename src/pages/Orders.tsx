import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, ShieldAlert, CheckCircle, Truck, RefreshCw, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Order } from '../types';

export const Orders: React.FC = () => {
  const { orders, user, cancelUserOrder, payments } = useApp();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter orders for logged in user (or all if admin simulating)
  const userOrders = orders.filter(o => o.user === (user?._id || 'guest'));

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you absolutely sure you wish to cancel this particular style lock order? Inventory will be reinstated.')) {
      await cancelUserOrder(id);
    }
  };

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Processing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-450 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-450 border-slate-550/20';
    }
  };

  if (userOrders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans space-y-4">
        <h2 className="font-display font-black text-2xl text-white">No Orders Placed Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Uncompromised garments are waiting. Complete checkouts to view active tracking registries here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans space-y-12">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">Your Orders History</h1>
        <p className="text-xs text-slate-400">Track logistics milestones, payments, and cancel listings.</p>
      </div>

      <div className="space-y-6">
        {userOrders.map(order => {
          const isExpanded = expandedOrderId === order._id;
          const matchedPayment = payments.find(p => p.order === order._id);

          return (
            <div 
              key={order._id}
              className="bg-[#12141C] border border-slate-850 rounded-lg overflow-hidden shadow"
            >
              {/* Header Box */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 bg-slate-950/20 text-xs">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-mono uppercase">ORDER REFERENCE</span>
                    <span className="text-white font-bold font-mono">{order._id}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-mono uppercase">PLACED DATE</span>
                    <span className="text-slate-300 font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-mono uppercase">GRAND TOTAL</span>
                    <span className="text-[#D4AF37] font-bold font-mono">{order.totalPrice.toLocaleString()} BDT</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-mono uppercase">AUDITED STATUS</span>
                    <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => toggleExpand(order._id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white font-semibold"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {order.orderStatus === 'Pending' && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all font-bold uppercase tracking-wider text-[10px]"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

              </div>

              {/* Collapsed Items details */}
              {isExpanded && (
                <div className="p-6 space-y-6 animate-slideDown border-t border-slate-850">
                  
                  {/* Progress Line */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-lg text-center border border-slate-800">
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-550 font-mono">1. SYSTEM BOOKING</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Ordered Secure
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-550 font-mono">2. STYLIST AUDITING</span>
                      <span className={`text-xs font-bold ${order.orderStatus !== 'Pending' && order.orderStatus !== 'Cancelled' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {order.orderStatus === 'Pending' ? '⏳ Verifying Payment' : order.orderStatus === 'Cancelled' ? '❌ Voided' : '✔ Confirmed fit'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-550 font-mono">3. LOGISTICS SHIPPED</span>
                      <span className={`text-xs font-bold ${order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {order.orderStatus === 'Shipped' ? '🚚 In Transit (Dhaka)' : order.orderStatus === 'Delivered' ? '✔ Arrived' : '⏳ Pending confirmation'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-550 font-mono">4. DELIVERY REACHED</span>
                      <span className={`text-xs font-bold ${order.orderStatus === 'Delivered' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {order.orderStatus === 'Delivered' ? '✔ Handed Over' : '⏳ Awaiting shipment'}
                      </span>
                    </div>
                  </div>

                  {/* List items table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">Specific Ordered Items</h4>
                    <div className="border border-slate-850 rounded bg-[#161924]/40 divide-y divide-slate-850">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <span className="font-bold text-white block">{item.name}</span>
                              <span className="font-mono text-slate-500 text-[10px]">Specifications: {item.size} • {item.color}</span>
                            </div>
                          </div>

                          <div className="flex gap-10 font-mono text-slate-400">
                            <span>Quantity: {item.quantity}</span>
                            <span className="font-bold text-white">{item.price.toLocaleString()} BDT</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Verification status */}
                  <div className="p-4 rounded-lg bg-slate-905 border border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">SETTLEMENT VERIFICATION</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`font-semibold ${order.isPaid ? 'text-emerald-400' : 'text-amber-500'}`}>
                          {order.isPaid ? '✔ Verified PAID via Merchant Console' : '⏳ Awaiting manual payment verification'}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-400 text-left sm:text-right">
                      <span className="block text-[9px] text-slate-500 uppercase font-mono">Payment Channel choice</span>
                      <strong className="text-white uppercase tracking-wider">{order.paymentMethod}</strong>
                      {matchedPayment && matchedPayment.transactionId && (
                        <span className="block font-mono text-[10px] mt-0.5">Hash ID: <strong className="text-[#D4AF37]">{matchedPayment.transactionId}</strong></span>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Orders;
