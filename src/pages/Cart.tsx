import React from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQty, clearCart } = useApp();
  const navigate = useNavigate();

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckoutRedirect = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-white mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Fill your confidence trunk with elite tailored traditional dresses, wool blazers, and sartorial jackets.
          </p>
        </div>
        <Link to="/shop" className="inline-block px-6 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-wider text-xs rounded transition-all">
          Explore Sartorial Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans space-y-12">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">Your Shopping Bag</h1>
        <p className="text-xs text-slate-400">Review selected looks, quantities, and adjust parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Hand: Items table details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#12141C] border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs font-bold text-slate-400 grid grid-cols-12 gap-2 text-center md:text-left">
              <span className="col-span-6 md:col-span-6 uppercase">Product Design</span>
              <span className="col-span-3 md:col-span-2 uppercase">Specifications</span>
              <span className="col-span-2 uppercase">Quantity</span>
              <span className="col-span-1 border-l border-slate-800 uppercase text-right md:pr-4">Price</span>
            </div>

            <div className="divide-y divide-slate-850">
              {cart.map((item, idx) => (
                <div key={idx} className="p-4 grid grid-cols-12 gap-4 items-center text-center md:text-left hover:bg-slate-900/10 transition-all">
                  
                  {/* Photo & title */}
                  <div className="col-span-12 md:col-span-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{item.product.name}</h4>
                      <span className="block text-[10px] text-slate-500 font-mono tracking-wider">{item.product.sku}</span>
                    </div>
                  </div>

                  {/* Size and Color selections */}
                  <div className="col-span-6 md:col-span-2 flex flex-col items-center md:items-start text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">Size: {item.size}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Color: {item.color}</span>
                  </div>

                  {/* Qty incrementer */}
                  <div className="col-span-3 md:col-span-2 flex justify-center md:justify-start">
                    <div className="flex items-center border border-slate-800 rounded bg-slate-900 h-9 font-mono overflow-hidden">
                      <button 
                        onClick={() => updateCartQty(item.product._id, item.size, item.color, Math.max(1, item.quantity - 1))}
                        className="px-2.5 text-slate-400 hover:bg-slate-800 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 font-semibold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.product._id, item.size, item.color, Math.min(item.product.stock, item.quantity + 1))}
                        className="px-2.5 text-slate-400 hover:bg-slate-800 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Delete triggers */}
                  <div className="col-span-3 md:col-span-2 flex flex-col justify-end items-end pr-4 text-xs font-mono space-y-2">
                    <span className="font-bold text-white">{(item.product.price * item.quantity).toLocaleString()} BDT</span>
                    <button 
                      onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                      className="p-1 px-2 rounded hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-all font-sans text-[10px] flex items-center gap-1 border border-slate-850"
                      title="Delete Outfit"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 font-sans text-xs pt-2">
            <Link to="/shop" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#D4AF37] transition-all font-semibold">
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            
            <button 
              onClick={clearCart}
              className="text-slate-500 hover:text-red-400 font-semibold uppercase tracking-wider text-[11px]"
            >
              Clear Entire Trunk Bags
            </button>
          </div>
        </div>

        {/* Right Hand: Elegant invoice summary calculation */}
        <div className="lg:col-span-4 bg-[#12141C] border border-slate-800 rounded-lg p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-extrabold text-[#D4AF37] text-base uppercase tracking-wider">Garments Invoice</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">ESTIMATED VALUATIONS</p>
          </div>

          <div className="text-xs space-y-3 font-medium">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal ({totalItemCount} outfits)</span>
              <span className="font-mono text-white">{cartTotal.toLocaleString()} BDT</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Dhaka Standard Shipping</span>
              <span className="font-mono text-white">60 BDT</span>
            </div>
            
            <hr className="border-slate-800/80" />

            <div className="flex justify-between text-sm py-2">
              <span className="font-extrabold text-white font-display">Est. Grand Total</span>
              <span className="font-mono font-black text-[#D4AF37]">{ (cartTotal + 60).toLocaleString() } BDT</span>
            </div>
          </div>

          <button 
            onClick={handleCheckoutRedirect}
            className="w-full py-4 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-widest text-xs transition-all rounded shadow-md flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-slate-500 font-sans text-center leading-relaxed">
            Immediate secure reserves. Complete your order within 10 minutes to guard your specific fabric stock indexes from being purchased.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Cart;
