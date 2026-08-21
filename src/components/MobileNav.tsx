import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const close = () => setIsMenuOpen(false);

  // Close on Escape and lock body scroll while the menu is open
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMenuOpen((v) => !v)}
        className="text-gray-600 relative z-50"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <>
          {/* Backdrop — tap outside to close */}
          <div
            className="fixed inset-0 top-16 bg-black/40 z-40"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel — anchored under the sticky 4rem header, scrolls if tall */}
          <div className="fixed top-16 inset-x-0 z-50 bg-white border-b border-gray-200 py-4 px-6 shadow-md max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain">
            <nav className="flex flex-col space-y-4">
              <a href="/" onClick={close} className="text-left text-lg font-semibold py-2">Home</a>
              <a href="/best-of/" onClick={close} className="text-left text-lg font-semibold py-2">Best of 2026</a>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Grooming Guides</p>
                <a href="/best-mens-back-shavers/" onClick={close} className="flex items-center gap-3 py-2 no-underline">
                  <span className="text-xl">🪒</span>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Best Back Shavers</p>
                    <p className="text-xs text-gray-400">4 picks · Tested 90 days</p>
                  </div>
                </a>
                <a href="/braun-type-5544-vs-series-7/" onClick={close} className="flex items-center gap-3 py-2 no-underline mt-2">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Braun 5544 vs Series 7</p>
                    <p className="text-xs text-gray-400">High-performance duel</p>
                  </div>
                </a>
                <a href="/buzz-cut-guide/" onClick={close} className="flex items-center gap-3 py-2 no-underline mt-2">
                  <span className="text-xl">💇</span>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Buzz Cut Guide</p>
                    <p className="text-xs text-gray-400">Complete 2026 guide for men</p>
                  </div>
                </a>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Home & DIY</p>
                <a href="/best-asphalt-sealer/" onClick={close} className="flex items-center gap-3 py-2 no-underline">
                  <span className="text-xl">🛣️</span>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Best Asphalt Sealer</p>
                    <p className="text-xs text-gray-400">Protect your driveway</p>
                  </div>
                </a>
                <a href="/best-cinder-block-sealer-reviews/" onClick={close} className="flex items-center gap-3 py-2 no-underline mt-2">
                  <span className="text-xl">🧱</span>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Best Cinder Block Sealer</p>
                    <p className="text-xs text-gray-400">Stop leaks fast</p>
                  </div>
                </a>
                <a href="/best-marble-sealer/" onClick={close} className="flex items-center gap-3 py-2 no-underline mt-2">
                  <span className="text-xl">💎</span>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Best Marble Sealer</p>
                    <p className="text-xs text-gray-400">Deep stone protection</p>
                  </div>
                </a>
              </div>
              <a href="/best-of/" onClick={close} className="text-left text-lg font-semibold py-2 border-t pt-4 text-[#FF4500]">Trending Deals</a>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
