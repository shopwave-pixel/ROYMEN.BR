import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ListOrdered, Search, Filter, Eye, CheckCircle, 
  XSquare, CreditCard, Ship, MapPin, Phone, Calendar, 
  Info, CheckCircle2, XCircle, AlertTriangle 
} from 'lucide-react';
import { Order, PaymentDetails } from '../../types';

export const OrdersManagement: React.FC = () => {
  const { 
    orders, payments, updateOrderStatus, verifyPayment 
  } = useApp();

  // Search/Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['orderStatus']>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'COD' | 'bKash' | 'Nagad'>('all');
  
  // Inspect Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Helper payment status badge
  const getOrderPaymentDetails = (order: Order): PaymentDetails | null => {
    if (typeof order.payment === 'object' && order.payment !== null) {
      return order.payment as PaymentDetails;
    }
    // Search in payments state by order ID
    const found = payments.find(p => p.order === order._id || p.order?._id === order._id);
    return found || null;
  };

  const getOrderStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Confirmed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Processing': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
    }
  };

  const getPaymentStatusBadge = (status: PaymentDetails['paymentStatus']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Paid': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Failed': return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const handleApprovePayment = async (payId: string) => {
    const success = await verifyPayment(payId, 'Paid');
    if (success) {
      alert('Manual secure transaction was audited and checked as PAID.');
      if (selectedOrder) {
        // Keeps local modal visual inspect state matched
        setSelectedOrder(prev => prev ? { ...prev, isPaid: true } : null);
      }
    }
  };

  const handleDenyPayment = async (payId: string) => {
    const success = await verifyPayment(payId, 'Failed');
    if (success) {
      alert('Payment receipt voided or rejected.');
    }
  };

  // Filter Pipeline
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.phone.includes(searchTerm) ||
        order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      const matchesMethod = methodFilter === 'all' || order.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [orders, searchTerm, statusFilter, methodFilter]);

  return (
    <div className="font-sans space-y-8 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase flex items-center gap-3">
          <ListOrdered className="w-7 h-7 text-[#D4AF37]" />
          Orders & Ledgers
        </h1>
        <p className="text-xs text-slate-450 mt-1">Govern checkout workflows, audit bKash/Nagad manual receipt tokens, and update logistics tracking.</p>
      </div>

      {/* Query filters */}
      <div className="bg-[#121522] border border-slate-850 p-5 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search Order Ref ID, customer mobile, shipping address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Filter Logistics */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Logistic states</option>
            <option value="Pending">Pending Audit</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Aboard Logistics</option>
            <option value="Delivered">Delivered Handover</option>
            <option value="Cancelled">Cancelled/Revoked</option>
          </select>
        </div>

        {/* Filter Gateway */}
        <div className="md:col-span-3">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Gateways</option>
            <option value="COD">Cash On Delivery</option>
            <option value="bKash">bKash Ledger Token</option>
            <option value="Nagad">Nagad Ledger Token</option>
          </select>
        </div>

      </div>

      {/* Orders pipeline listing */}
      <div className="border border-slate-850 rounded-lg overflow-hidden bg-[#121522]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161a29]/80 text-slate-400 font-bold border-b border-slate-800 selection:none">
              <tr>
                <th className="p-4">Invoice Reference</th>
                <th className="p-4">Dispatch Address</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Paid Status</th>
                <th className="p-4">Logistic Station</th>
                <th className="p-4 text-right">Invoice / Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-550 italic">
                    No active invoice instances found matching your specification filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const payment = getOrderPaymentDetails(order);
                  return (
                    <tr key={order._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-black text-white tracking-widest block">{order._id}</span>
                        <span className="text-[10px] text-slate-500 font-mono italic block mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'}) : 'Raw Draft'}
                        </span>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="font-semibold text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span className="max-w-xs truncate" title={order.shippingAddress}>{order.shippingAddress}</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-450 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{order.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#D4AF37]">
                        {order.paymentMethod}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-200">
                        {order.totalPrice.toLocaleString()} BDT
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.isPaid 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                          }`}>
                            {order.isPaid ? 'PAID' : 'AWAITING FUNDS'}
                          </span>
                          {payment && payment.paymentMethod !== 'COD' && (
                            <div className="text-[10px] text-slate-500 font-mono tracking-wider font-bold uppercase block">
                              TrxID: <span className="text-[#D4AF37]">{payment.transactionId}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${getOrderStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all text-xs"
                          title="Inspect Invoice details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-slate-350 font-bold outline-none focus:border-[#D4AF37] h-[34px]"
                        >
                          <option value="Pending">Pending Audit</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped Aboard</option>
                          <option value="Delivered">Delivered Done</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED INSPECTION MODAL */}
      {selectedOrder && (() => {
        const payment = getOrderPaymentDetails(selectedOrder);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p- bg-black/85 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#12141C] border border-slate-850 rounded-lg shadow-2xl p-6 my-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-500/10 rounded-lg text-[#D4AF37]">
                    <ListOrdered className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                      Invoice details summary
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5 font-bold">
                      REF ID: #{selectedOrder._id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Close panel
                </button>
              </div>

              {/* Informative Grid Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Shipping info */}
                <div className="p-4 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                  <h4 className="font-semibold text-[#D4AF37] uppercase tracking-wider text-[10px]">
                    Dispatch Logistics address
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{selectedOrder.shippingAddress}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{selectedOrder.phone}</span>
                    </p>
                    <p className="flex items-center gap-2 font-mono text-[11px] text-slate-450 pt-1 border-t border-slate-800/40">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Placed On: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Secure Payment status */}
                <div className="p-4 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                  <h4 className="font-semibold text-[#D4AF37] uppercase tracking-wider text-[10px]">
                    Ledger Audit stations
                  </h4>
                  <div className="space-y-2 text-slate-300">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Gateway Channel:</span>
                      <strong className="font-mono text-[#D4AF37] uppercase text-[11px]">{selectedOrder.paymentMethod}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Funds Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        selectedOrder.isPaid 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                      }`}>
                        {selectedOrder.isPaid ? 'PAID / CONSOLIDATED' : 'AWAITING FUNDS'}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Logistic Level:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${getOrderStatusBadge(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Order Cart items */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] block">
                  Design items checkout list
                </h4>
                <div className="border border-slate-850 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#12141C] text-slate-500 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Apparel design</th>
                        <th className="p-3 text-center">Size</th>
                        <th className="p-3 text-center">Color</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                      {selectedOrder.orderItems?.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-900/30">
                          <td className="p-3 font-bold text-slate-200">
                            {item.name}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-400">
                            {item.size || 'M'}
                          </td>
                          <td className="p-3 text-center text-slate-400 italic">
                            {item.color || 'Dark Shade'}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-300">
                            {item.price.toLocaleString()} BDT
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-slate-400">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#D4AF37]">
                            {(item.price * item.quantity).toLocaleString()} BDT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial statement summary */}
              <div className="bg-slate-900/65 border border-slate-850 p-4 rounded-lg space-y-2 text-xs max-w-sm ml-auto">
                <div className="flex justify-between text-slate-450">
                  <span>Checkout Items cost:</span>
                  <span className="font-mono">{(selectedOrder.totalPrice - selectedOrder.shippingPrice).toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between text-slate-450">
                  <span>Courier / Handover:</span>
                  <span className="font-mono">{selectedOrder.shippingPrice.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm border-t border-slate-800 pt-2">
                  <span>Grand total valuation:</span>
                  <span className="font-mono text-[#D4AF37]">{selectedOrder.totalPrice.toLocaleString()} BDT</span>
                </div>
              </div>

              {/* Manual Mobile Payment verification audit form */}
              {payment && payment.paymentMethod !== 'COD' && (
                <div className="p-5 bg-amber-500/5 rounded-lg border border-amber-500/10 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Auditable manual transaction receipts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                      <span className="block text-[10px] text-slate-500 font-semibold uppercase font-sans mb-1">Receipt Channel</span>
                      <strong className="text-white text-xs font-bold tracking-widest">{payment.paymentMethod} Mobile Money</strong>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                      <span className="block text-[10px] text-slate-500 font-semibold uppercase font-sans mb-1">Sender Mobile</span>
                      <strong className="text-white text-xs">{payment.senderPhone || 'N/A'}</strong>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                      <span className="block text-[10px] text-slate-500 font-semibold uppercase font-sans mb-1">Transaction Ref. (TrxID)</span>
                      <strong className="text-[#D4AF37] text-xs font-bold select-all">{payment.transactionId || 'N/A'}</strong>
                    </div>
                  </div>

                  {payment.paymentStatus === 'Pending' ? (
                    <div className="flex justify-end gap-3 text-xs font-bold uppercase tracking-wider pt-1.5">
                      <button
                        onClick={() => handleDenyPayment(payment._id)}
                        className="px-4 py-2 rounded bg-rose-500/10 text-rose-450 border border-rose-500/25 hover:bg-rose-600 hover:text-white transition-all duration-300"
                      >
                        Reject transaction
                      </button>
                      <button
                        onClick={() => handleApprovePayment(payment._id)}
                        className="px-5 py-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-lg"
                      >
                        Approve PAID status
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 px-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs">
                      <span className="text-slate-500">Administrative Audit Status:</span>
                      <span className={`font-bold ${payment.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {payment.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default OrdersManagement;
