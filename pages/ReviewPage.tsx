
import React from 'react';
import { Product } from '../types';
import { Star, CheckCircle2, XCircle, Info, ExternalLink, ChevronRight, MessageSquare, ShieldCheck, TrendingUp } from 'lucide-react';
import { ScarcityBadge, UrgencyTimer, SocialProof, TrustBadge } from '../components/PsychologicalTriggers';

export const ReviewPage: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
        <a href="#" className="hover:text-[#1E90FF]">Home</a>
        <ChevronRight size={16} className="mx-2" />
        <a href="#" className="hover:text-[#1E90FF]">Reviews</a>
        <ChevronRight size={16} className="mx-2" />
        <a href="#" className="hover:text-[#1E90FF] capitalize">{product.category}</a>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-[#333333] font-medium">{product.name}</span>
      </nav>

      {/* Intro Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap gap-2 mb-4">
            {product.badges?.map(b => (
              <span key={b} className="bg-[#1E90FF] text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">{b}</span>
            ))}
            <TrustBadge />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 text-[#333333] tracking-tight leading-[1.1]">
            {product.name} Review: <span className="text-[#1E90FF]">Is it Truly Worth It in 2026?</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed italic">
            "{product.tagline}"
          </p>
          <div className="flex items-center gap-6 mb-8 border-y border-gray-100 py-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=33" alt="Expert" />
              </div>
              <div>
                <p className="text-sm font-bold">Reviewed by Alex Rivers</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Tech Lead • 12 Year Pro</p>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold">Last Updated</p>
              <p className="text-xs text-gray-500">October 24, 2026</p>
            </div>
          </div>
          <SocialProof users="14.2k" />
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <TrendingUp className="text-[#1E90FF] opacity-10" size={100} />
            </div>
            <img src={product.imageUrl} className="w-full rounded-2xl mb-8 shadow-sm border border-gray-100" alt={product.name} />
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-4xl font-black text-[#333333]">${product.price}</span>
              <span className="text-gray-400 line-through text-lg font-medium">$1,299.00</span>
            </div>
            <div className="mb-8">
               <ScarcityBadge count={7} />
            </div>
            <a 
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#FF4500] hover:bg-[#E63E00] text-white text-center py-5 rounded-xl font-black text-xl shadow-xl transition-all transform hover:-translate-y-1 mb-4 flex items-center justify-center gap-2"
            >
              Check Price on Amazon <ExternalLink size={20} />
            </a>
            <p className="text-center text-xs text-gray-400 font-medium">Free 2-Day Shipping for Prime Members</p>
          </div>
        </div>
      </div>

      {/* Content Tabs / Nav */}
      <div className="lg:grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          {/* Executive Summary */}
          <section className="prose prose-lg max-w-none mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
               The Bottom Line
            </h2>
            <div className="bg-[#1E90FF]/5 border-l-4 border-[#1E90FF] p-8 rounded-r-2xl italic text-xl text-gray-700 leading-relaxed mb-10">
              "If you are looking for {product.category} that balances performance with premium build quality, the {product.name} is currently our #1 recommendation. While expensive, the value it provides over a 5-year period is unmatched."
            </div>

            <h3 className="text-2xl font-bold mb-4">Why We Chose It</h3>
            <p className="text-gray-600 mb-8">
              {product.description} We put this through 45 unique stress tests, simulating over 500 hours of real-world usage. From heat management to software stability, this product excelled in areas where competitors typically fail.
            </p>

            {/* Pros and Cons Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <div className="bg-green-50/50 p-8 rounded-3xl border border-green-100">
                <h4 className="flex items-center gap-2 text-green-700 font-bold mb-4 text-xl">
                  <CheckCircle2 size={24} /> What We Love
                </h4>
                <ul className="space-y-3">
                  {product.pros.map(pro => (
                    <li key={pro} className="flex items-start gap-2 text-gray-700 font-medium">
                      <span className="text-green-500 mt-1">•</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50/50 p-8 rounded-3xl border border-red-100">
                <h4 className="flex items-center gap-2 text-red-700 font-bold mb-4 text-xl">
                  <XCircle size={24} /> What to Watch For
                </h4>
                <ul className="space-y-3">
                  {product.cons.map(con => (
                    <li key={con} className="flex items-start gap-2 text-gray-700 font-medium">
                      <span className="text-red-500 mt-1">•</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key Specs */}
            <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
            <div className="overflow-hidden border border-gray-200 rounded-2xl mb-12">
              <table className="w-full text-left">
                <tbody>
                  {Object.entries(product.specs).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 font-bold text-gray-600 w-1/3 border-r border-gray-100">{key}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Deep Dive Content (SEO Focused) */}
            <h3 className="text-2xl font-bold mb-6">In-Depth Performance Analysis</h3>
            <p className="text-gray-600 mb-6">
              When we first unboxed the {product.name}, the attention to detail was immediate. But aesthetic is nothing without performance. During our <strong>Color Calibration Test</strong>, we measured a Delta E of less than 1.0, which is virtually indistinguishable to the human eye. This makes it a titan in the creative industry.
            </p>
            <p className="text-gray-600 mb-6">
              However, it wasn't all sunshine. The stand, while robust, has a massive footprint. If you have a shallow desk (less than 30 inches), you'll likely want to invest in a VESA mount. This is the kind of practical insight we pride ourselves on at The Honest Reviewers.
            </p>
            <div className="bg-gray-900 text-white p-10 rounded-3xl my-12 relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-2xl font-bold mb-4">Did You Know?</h4>
                 <p className="text-gray-300 text-lg">
                   Users who switch to {product.category} with {Object.values(product.specs)[0]} report a 30% increase in productivity during the first month.
                 </p>
               </div>
               <div className="absolute bottom-0 right-0 opacity-10">
                  <Info size={150} />
               </div>
            </div>
          </section>

          {/* FAQ Schema Placeholder */}
          <section className="border-t border-gray-100 pt-16">
            <h3 className="text-3xl font-bold mb-8">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                <h5 className="font-bold text-lg mb-2">Is the {product.name} compatible with older systems?</h5>
                <p className="text-gray-600">Yes, though you may need a specific adapter for USB-C or Thunderbolt compatibility depending on your hardware generation.</p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                <h5 className="font-bold text-lg mb-2">Does this product come with a warranty?</h5>
                <p className="text-gray-600">VisionTech offers a standard 3-year limited warranty which covers most manufacturing defects and panel failures.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8 mt-12 lg:mt-0">
          <div className="bg-[#1E90FF] p-8 rounded-3xl text-white">
            <h4 className="text-xl font-bold mb-4">Get Our Buying Guide</h4>
            <p className="mb-6 text-white/80">Don't buy the wrong {product.category}. Join 50k subscribers for our weekly gear cheatsheet.</p>
            <input type="email" placeholder="Email address" className="w-full p-4 rounded-xl mb-4 text-gray-900 focus:outline-none" />
            <button className="w-full bg-white text-[#1E90FF] py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              Send Me The Guide
            </button>
          </div>

          <div className="border border-gray-100 rounded-3xl p-8 bg-gray-50">
            <h4 className="text-xl font-bold mb-6">Related Reviews</h4>
            <div className="space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <img src={`https://picsum.photos/seed/${i+100}/200/200`} className="w-20 h-20 rounded-xl object-cover" alt="Related" />
                  <div>
                    <h5 className="font-bold text-gray-900 group-hover:text-[#1E90FF] line-clamp-2">Best {product.category} Under $500 (2026 Rankings)</h5>
                    <p className="text-xs text-gray-500 mt-1">5 Min Read</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
