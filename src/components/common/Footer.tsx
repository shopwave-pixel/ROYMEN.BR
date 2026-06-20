import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShoppingBag, Landmark, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0B10] border-t border-slate-800 text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Presentation Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#D4AF37] flex items-center justify-center font-display font-extrabold text-slate-950 text-base shadow">
                R
              </div>
              <span className="font-display font-black text-lg text-white tracking-[2px]">ROY MEN</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bespoke artisanal design custom-tailored for the modern class. Embody elegance, display strength, and wear your confidence daily.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              © {new Date().getFullYear()} ROY MEN BD. Premium Garment Ecosystem.
            </p>
          </div>

          {/* Quick links Store */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Explore Store</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-[#D4AF37] transition-all">Home Collections</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#D4AF37] transition-all">Sartorial Catalog</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#D4AF37] transition-all">Saved Looks</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#D4AF37] transition-all">Shopping Bag</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Guarantees</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Cotton Cotton</span>
              </li>
              <li className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#D4AF37]" />
                <span>Immediate bKash Auditing</span>
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span>Discrepancy Replacements</span>
              </li>
            </ul>
          </div>

          {/* Contact Details and Address block */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Headquarters</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Banani Road 11, Suite 4B, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>+880 1712 994432</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>concierge@roymen.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 mt-8 pt-6 text-center">
          <p className="text-[10px] text-slate-600 font-mono tracking-wider">
            DHAKA PLATFORM STAGE — SHIPPED NATIONWIDE WITH HIGH-FLYER TRUST.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
