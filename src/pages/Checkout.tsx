import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle, Landmark, ShieldCheck, AlertCircle } from 'lucide-react';
import Loader from '../components/common/Loader';

export const Checkout: React.FC = () => {
  const { cart, user, placeOrder } = useApp();
  const navigate = useNavigate();

  // Basic totals
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const grandTotal = cartTotal + 60;

  // Checkout states
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  const [localLoading, setLocalLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (cart.length === 0 && !successReceipt) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans space-y-4">
        <h2 className="font-display font-bold text-xl text-white">Your bag is empty</h2>
        <Link to="/shop" className="inline-block px-5 py-2.5 bg-[#D4AF37] text-slate-950 font-bold uppercase tracking-widest text-xs rounded">
          Shop Outfits
        </Link>
      </div>
    );
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!shippingAddress.trim() || !phone.trim() || !name.trim()) {
      setValidationError('Please supply complete Name, Delivery Address, and active Phone number.');
      return;
    }

    if (paymentMethod !== 'COD') {
      if (!transactionId.trim() || !senderPhone.trim()) {
        setValidationError('Mobile wallet transfers (bKash/Nagad) require the transaction ID (TrxID) and sender phone handles to check logs.');
        return;
      }
    }

    setLocalLoading(true);
    try {
      const order = await placeOrder(
        shippingAddress,
        phone,
        paymentMethod,
        paymentMethod !== 'COD' ? transactionId : undefined,
        paymentMethod !== 'COD' ? senderPhone : undefined
      );

      setSuccessReceipt(order);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to written order. Please retry.');
    } finally {
      setLocalLoading(false);
    }
  };

  if (localLoading) {
    return <Loader fullScreen message="Submtting order details & reserving garment inventories..." />;
  }

  // 1. Success Receipt view
  if (successReceipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 font-sans text-center space-y-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-[4px] text-[#D4AF37] uppercase font-bold">ORDER WRITTEN SUCCESSFULLY</span>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white">Confidence has Shipped.</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Your premium dress patterns are locked. Thank you for choosing ROY MEN. Below is your financial index metadata.
          </p>
        </div>

        {/* Detailed Receipt Card */}
        <div className="bg-[#12141C] border border-slate-800 rounded-lg p-6 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-850 gap-2">
            <div>
              <span className="block text-[10px] text-slate-500 font-mono">ORDER REFERENCE</span>
              <span className="text-sm font-extrabold text-white font-mono">{successReceipt._id}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 sm:text-right font-mono">ESTIMATED LANDING Handovers</span>
              <span className="text-xs font-semibold text-[#D4AF37] sm:text-right block">24 - 48 Hours Dhaka standard</span>
            </div>
          </div>

          <div className="text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Customer Name:</span>
              <span className="text-white font-bold">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Shipping Address:</span>
              <span className="text-white font-bold text-right max-w-[250px] truncate" title={shippingAddress}>{shippingAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Active Contact Call:</span>
              <span className="text-white font-mono">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Channel Choice:</span>
              <span className="text-[#D4AF37] font-bold uppercase tracking-wider">{paymentMethod}</span>
            </div>
            {paymentMethod !== 'COD' && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Submitted TrxID:</span>
                  <span className="text-white font-mono font-bold uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Sender Wallet:</span>
                  <span className="text-white font-mono">{senderPhone}</span>
                </div>
              </>
            )}
            
            <hr className="border-slate-850" />

            <div className="flex justify-between text-sm py-1">
              <span className="font-extrabold text-white font-display">Paid amount:</span>
              <span className="font-mono font-black text-white">{grandTotal.toLocaleString()} BDT</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/orders" className="px-6 py-3 border border-slate-800 hover:border-slate-500 text-slate-300 transition-all rounded text-xs font-bold uppercase tracking-widest bg-slate-900/40">
            View Order History
          </Link>
          <Link to="/shop" className="px-6 py-3 bg-[#D4AF37] text-slate-950 font-bold uppercase tracking-widest text-xs rounded hover:bg-yellow-500 transition-all">
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans space-y-12">
      
      {/* Back to bag banner */}
      <div>
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs text-[#D4AF37] hover:text-white transition-all font-semibold uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Shopping Bag Bag</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Hand Form */}
        <form onSubmit={handleOrderSubmit} className="lg:col-span-7 bg-[#12141C] border border-slate-800 rounded-lg p-6 space-y-8">
          
          <div className="border-b border-slate-800 pb-4">
            <h2 className="font-display font-black text-xl text-white">Delivery Details</h2>
            <p className="text-xs text-slate-400">Complete recipient shipping coordinates below.</p>
          </div>

          {validationError && (
            <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-100 rounded text-xs leading-relaxed flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="space-y-1.5 col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Recipient Full Name</label>
              <input 
                type="text" 
                placeholder="Ex. Anwar Sadat"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Delivery Address (Floor, Road, City specifics)</label>
              <textarea 
                placeholder="Ex. House 24, Road 11, Block C, Apt 4B, Banani, Dhaka"
                required
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] resize-none"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Contact Call Number</label>
              <input 
                type="tel" 
                placeholder="Ex. +8801712994432"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>

          </div>

          <div className="border-b border-slate-850 pt-4 pb-2">
            <h3 className="font-display font-extrabold text-[#D4AF37] text-sm uppercase tracking-widest">Settlement Selection</h3>
          </div>

          {/* Payment option selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            
            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`p-4 rounded border transition-all ${
                paymentMethod === 'COD' 
                  ? 'bg-amber-500/10 border-[#D4AF37] text-[#D4AF37] font-bold' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              <span className="block text-sm">Cash On Delivery</span>
              <span className="text-[10px] opacity-75 font-sans mt-1">Settle at door</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bKash')}
              className={`p-4 rounded border transition-all ${
                paymentMethod === 'bKash' 
                  ? 'bg-amber-500/10 border-[#D4AF37] text-[#D4AF37] font-bold' 
                  : 'bg-slate-900 border-slate-800 text-[#E2136E] hover:border-slate-500'
              }`}
            >
              <span className="block text-sm">bKash Manual</span>
              <span className="text-[10px] opacity-75 text-slate-400 font-sans mt-1">Manual audit lookup</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Nagad')}
              className={`p-4 rounded border transition-all ${
                paymentMethod === 'Nagad' 
                  ? 'bg-amber-500/10 border-[#D4AF37] text-[#D4AF37] font-bold' 
                  : 'bg-slate-900 border-slate-800 text-[#F89E1B] hover:border-slate-500'
              }`}
            >
              <span className="block text-sm">Nagad Manual</span>
              <span className="text-[10px] opacity-75 text-slate-400 font-sans mt-1">Manual audit lookup</span>
            </button>

          </div>

          {/* Sub options details for mobile transfer wallets */}
          {paymentMethod !== 'COD' && (
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-lg text-xs space-y-4 font-sans animate-slideDown">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#D4AF37] font-extrabold uppercase tracking-wide">
                  <Landmark className="w-4 h-4" />
                  <span>Manual Ledger Transfer Guidelines</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Please send or pay the Exact total sum of <strong className="text-white font-mono">{grandTotal.toLocaleString()} BDT</strong> to our verified merchant ledger wallet <strong className="text-white font-mono">+8801712994432</strong> via standard SEND MONEY or CASH OUT options.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Transaction reference Hash (TrxID)</label>
                  <input 
                    type="text" 
                    placeholder="Ex. 9K82JD8A92"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] font-mono font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Your Sending Wallet mobile number</label>
                  <input 
                    type="tel" 
                    placeholder="Ex. +8801712123456"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/30 p-4 rounded border border-slate-850">
            <div className="flex gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <div className="text-left">
                <span className="block font-bold text-white text-xs">Sartorial Authenticity Guarantee</span>
                <p className="text-[10px] text-slate-500">Immediate priority allocation. Secured.</p>
              </div>
            </div>
            
            <button 
              type="submit"
              className="px-8 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded shadow transition-all h-12"
            >
              Complete Order Lock
            </button>
          </div>

        </form>

        {/* Right Hand Invoice Column */}
        <div className="lg:col-span-5 bg-[#12141C] border border-slate-800 rounded-lg p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-extrabold text-[#D4AF37] text-base uppercase tracking-width">Styles Summary</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{totalItemCount} INDIVIDUAL COUTURE LINES</p>
          </div>

          {/* Cart list scrollable */}
          <div className="max-h-[250px] overflow-y-auto pr-2 divide-y divide-slate-850/60 scrollbar-custom">
            {cart.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-950 border border-slate-850 rounded overflow-hidden shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white line-clamp-1 max-w-[150px]">{item.product.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">{item.size} • {item.color} • Qty {item.quantity}</span>
                  </div>
                </div>

                <span className="font-mono text-slate-300">{(item.product.price * item.quantity).toLocaleString()} BDT</span>

              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3 font-medium text-xs">
            <div className="flex justify-between text-slate-450">
              <span className="text-slate-400">Total outfits cost:</span>
              <span className="font-mono text-white">{cartTotal.toLocaleString()} BDT</span>
            </div>
            
            <div className="flex justify-between text-slate-450">
              <span className="text-slate-400">Standard Shipping:</span>
              <span className="font-mono text-white">60 BDT</span>
            </div>

            <hr className="border-slate-800/80" />

            <div className="flex justify-between text-sm py-1">
              <span className="font-extrabold text-white font-display">Est. Total:</span>
              <span className="font-mono font-black text-[#D4AF37]">{grandTotal.toLocaleString()} BDT</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Checkout;
