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
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Grooming Guides</p>
              <a href="/best-mens-back-shavers" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-2 no-underline">
                <span className="text-xl">🪒</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Best Back Shavers</p>
                  <p className="text-xs text-gray-400">4 picks · Tested 90 days</p>
                </div>
              </a>
              <a href="/braun-type-5544-vs-series-7" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-2 no-underline mt-2">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Braun 5544 vs Series 7</p>
                  <p className="text-xs text-gray-400">High-performance duel</p>
                </div>
              </a>
              <a href="/buzz-cut-guide" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-2 no-underline mt-2">
                <span className="text-xl">💇</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Buzz Cut Guide</p>
                  <p className="text-xs text-gray-400">Complete 2026 guide for men</p>
                </div>
              </a>
              <a href="/haircut-numbers" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-2 no-underline mt-2">
                <span className="text-xl">🔢</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Haircut Numbers</p>
                  <p className="text-xs text-gray-400">Every clipper guard explained</p>
                </div>
              </a>
            </div>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="text-left text-lg font-semibold py-2 border-t pt-4 text-[#FF4500]">Trending Deals</a>
          </nav>
        </div>
      )}
    </div>
  );
}
