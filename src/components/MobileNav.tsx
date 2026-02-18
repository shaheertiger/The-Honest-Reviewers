import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 py-4 px-6 shadow-md z-50">
          <nav className="flex flex-col space-y-4">
            <a href="/" onClick={() => setIsMenuOpen(false)} className="text-left text-lg font-semibold py-2">Home</a>
            <a href="/best-of" onClick={() => setIsMenuOpen(false)} className="text-left text-lg font-semibold py-2">Best of 2026</a>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="text-left text-lg font-semibold py-2">Buyer Guides</a>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="text-left text-lg font-semibold py-2 border-t pt-4 text-[#FF4500]">Trending Deals</a>
          </nav>
        </div>
      )}
    </div>
  );
}
