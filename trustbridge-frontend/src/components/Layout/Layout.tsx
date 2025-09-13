import React from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import Header from './Header';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-black text-off-white">
      {/* Custom Cursor */}
      <div className="cursor hidden lg:block" />
      <div className="cursor-follower hidden lg:block" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <motion.main
          className={cn('min-h-screen', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
