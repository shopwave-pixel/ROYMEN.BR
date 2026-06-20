import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F111A] text-slate-100 flex flex-col justify-between selection:bg-[#D4AF37]/35 selection:text-white">
      <div>
        <Navbar />
        <main className="animate-fadeIn">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
