import React from 'react';
import Footer from '../ui/Footer';
import { Navigation } from './Navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
