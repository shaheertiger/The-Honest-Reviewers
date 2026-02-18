
import React, { useState } from 'react';
import { Menu, X, Search, ChevronRight, ShoppingCart } from 'lucide-react';
import { PageType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onNavigate: (page: PageType, id?: string) => void;
  stickyCta?: { text: string; link: string };
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, stickyCta }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(PageType.HOME)}>
              <span className="text-2xl font-black tracking-tighter text-[#1E90FF]">THE HONEST</span>
              <span className="text-2xl font-black tracking-tighter text-[#333333]">REVIEWERS</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              <button onClick={() => onNavigate(PageType.HOME)} className="text-gray-600 hover:text-[#1E90FF] font-medium">Home</button>
              <button onClick={() => onNavigate(PageType.BEST_OF)} className="text-gray-600 hover:text-[#1E90FF] font-medium">Best Lists</button>
              <button className="text-gray-600 hover:text-[#1E90FF] font-medium">Guides</button>
              <div className="relative group">
                <Search className="w-5 h-5 text-gray-400 group-hover:text-[#1E90FF] cursor-pointer" />
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 py-4 px-6 animate-in slide-in-from-top">
            <nav className="flex flex-col space-y-4">
              <button onClick={() => {onNavigate(PageType.HOME); setIsMenuOpen(false)}} className="text-left text-lg font-semibold py-2">Home</button>
              <button onClick={() => {onNavigate(PageType.BEST_OF); setIsMenuOpen(false)}} className="text-left text-lg font-semibold py-2">Best of 2026</button>
              <button className="text-left text-lg font-semibold py-2">Buyer Guides</button>
              <button className="text-left text-lg font-semibold py-2 border-t pt-4 text-[#FF4500]">Trending Deals</button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Mobile Sticky CTA */}
      {stickyCta && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <a
            href={stickyCta.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#FF4500] hover:bg-[#E63E00] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            {stickyCta.text} <ChevronRight size={20} />
          </a>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-24 md:pb-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">The Honest Reviewers</h2>
              <p className="text-gray-600 max-w-sm mb-6 leading-relaxed">
                Our mission is to cut through the marketing noise and provide genuine, expert-led reviews that help you save time and money.
              </p>
              <div className="bg-[#1E90FF]/10 p-4 rounded-lg border border-[#1E90FF]/20">
                <p className="text-xs text-[#1E90FF] font-bold uppercase tracking-wider mb-1">Affiliate Disclosure</p>
                <p className="text-xs text-gray-500 leading-tight">
                  We are a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for us to earn fees by linking to Amazon.com and affiliated sites.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Categories</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-[#1E90FF]">Smart Home</a></li>
                <li><a href="#" className="hover:text-[#1E90FF]">Kitchen Gear</a></li>
                <li><a href="#" className="hover:text-[#1E90FF]">Tech Reviews</a></li>
                <li><a href="#" className="hover:text-[#1E90FF]">Fitness Tech</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-[#1E90FF]">About Our Team</a></li>
                <li><a href="#" className="hover:text-[#1E90FF]">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#1E90FF]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#1E90FF]">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} The Honest Reviewers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
