
import React from 'react';
import { PRODUCTS } from '../constants';
import { PageType } from '../types';
import { ChevronRight, Award, Info, ShoppingCart, Star, Check } from 'lucide-react';
import { ScarcityBadge, UrgencyTimer } from '../components/PsychologicalTriggers';

export const BestOfPage: React.FC<{ onNavigate: (page: PageType, id?: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-black uppercase tracking-widest border border-yellow-200 mb-6">
          <Award size={16} /> Updated for October 2026
        </div>
        <h1 className="text-4xl lg:text-7xl font-black text-[#333333] mb-6 tracking-tight">
          The 10 Best <span className="text-[#1E90FF]">Tech Gadgets</span> of 2026
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          We've tested 45 models over 6 months to find the absolute best options for every budget.
        </p>
      </header>

      {/* Quick Comparison Table */}
      <section className="mb-20 overflow-x-auto">
        <div className="min-w-[800px] border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 p-6 flex items-center justify-between border-b border-gray-100">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <Info className="text-[#1E90FF]" /> Quick Comparison Table
             </h3>
             <UrgencyTimer />
          </div>
          <table className="w-full">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rank/Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Key Performance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Our Verdict</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-black text-gray-200">#0{idx + 1}</span>
                      <div>
                        <p className="font-black text-gray-900">{p.name}</p>
                        <div className="flex text-yellow-400 mt-1">
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-b border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(p.specs).slice(0, 2).map(([k, v]) => (
                        <span key={k} className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600">{v}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-6 border-b border-gray-100">
                    <span className="text-sm font-medium text-[#1E90FF] bg-[#1E90FF]/5 px-3 py-1 rounded-full border border-[#1E90FF]/10 uppercase tracking-tighter">
                      {p.badges?.[0] || 'Top Contender'}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-b border-gray-100">
                    <button 
                      onClick={() => onNavigate(PageType.REVIEW, p.id)}
                      className="bg-[#333333] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-black transition-all"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed List */}
      <div className="space-y-16">
        {PRODUCTS.map((product, index) => (
          <div key={product.id} className="relative bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all">
            <div className="absolute top-0 left-0 bg-[#333333] text-white px-8 py-4 rounded-br-[2rem] font-black text-3xl z-10">
              #{index + 1}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 lg:p-12">
              <div className="lg:col-span-4 flex flex-col justify-center">
                <img src={product.imageUrl} alt={product.name} className="w-full rounded-2xl shadow-sm border border-gray-100" />
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                    <Check size={18} /> Most Reliable in Category
                  </div>
                  <ScarcityBadge count={index + 2} />
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.badges?.map(b => (
                    <span key={b} className="bg-[#1E90FF] text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{b}</span>
                  ))}
                </div>
                <h2 className="text-3xl lg:text-4xl font-black mb-4">{product.name}</h2>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl font-black text-[#FF4500]">${product.price}</span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                  </div>
                  <span className="text-gray-400 text-sm">{product.reviewCount.toLocaleString()} reviews</span>
                </div>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  The {product.name} took the top spot because it offers a perfect synergy of hardware and intuitive software. Unlike its competitors, it doesn't require complex setup, making it ideal for both power users and beginners. 
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <p className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs border-b pb-2">Top Features</p>
                    {product.pros.map(pro => (
                      <div key={pro} className="flex items-start gap-2 text-gray-600 text-sm font-medium">
                        <Check size={16} className="text-[#1E90FF] mt-0.5" /> {pro}
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                     <p className="font-bold text-gray-900 mb-3 text-sm">Expert Verdict</p>
                     <p className="text-gray-600 text-sm leading-relaxed italic">
                        "The most balanced {product.category} we've ever tested. If you have the budget, this is the one to get."
                     </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <a 
                    href={product.amazonUrl}
                    className="flex-1 bg-[#FF4500] hover:bg-[#E63E00] text-white text-center py-4 rounded-xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    Check Price on Amazon <ShoppingCart size={20} />
                  </a>
                  <button 
                    onClick={() => onNavigate(PageType.REVIEW, product.id)}
                    className="flex-1 bg-white border-2 border-gray-200 text-gray-900 text-center py-4 rounded-xl font-black text-lg hover:border-[#1E90FF] hover:text-[#1E90FF] transition-all"
                  >
                    Read Detailed Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
