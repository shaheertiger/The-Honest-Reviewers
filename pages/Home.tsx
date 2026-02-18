
import React from 'react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { PageType } from '../types';
// Added ChevronRight to the import list
import { ArrowRight, Star, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';
import { TrustBadge, UrgencyTimer } from '../components/PsychologicalTriggers';

export const Home: React.FC<{ onNavigate: (page: PageType, id?: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-block mb-4">
                <TrustBadge />
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-[#333333] mb-6 leading-[1.1]">
                Stop Guessing. <br />
                <span className="text-[#1E90FF]">Start Buying Smarter.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The Honest Reviewers test thousands of products every year so you can find the perfect match for your life and budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => onNavigate(PageType.BEST_OF)}
                  className="bg-[#FF4500] hover:bg-[#E63E00] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all"
                >
                  View Best of 2026 <ArrowRight size={20} />
                </button>
                <button className="bg-white hover:bg-gray-50 text-[#333333] border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg shadow-sm">
                  How We Test
                </button>
              </div>
            </div>
            <div className="mt-16 lg:mt-0 relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#1E90FF]/10 rounded-full blur-3xl"></div>
              <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/gadget/1200/800" 
                  alt="Review Showcase" 
                  className="w-full h-auto rounded-xl object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-white/50 shadow-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1E90FF] uppercase">Latest Review</p>
                      <h3 className="font-bold text-gray-900">UltraVision Pro OLED 4K</h3>
                    </div>
                    <button 
                      onClick={() => onNavigate(PageType.REVIEW, 'p1')}
                      className="bg-[#FF4500] text-white p-2 rounded-lg"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[#1E90FF]" /> Trending Categories
          </h2>
          <button className="text-[#1E90FF] font-bold hover:underline flex items-center gap-1">
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.id} 
              className="group cursor-pointer bg-white border border-gray-100 p-8 rounded-3xl text-center hover:border-[#1E90FF] hover:shadow-xl transition-all"
            >
              <span className="text-5xl block mb-6 transform group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold text-lg group-hover:text-[#1E90FF]">{cat.name}</h3>
              <p className="text-gray-400 text-sm mt-2">120+ Reviews</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Reviews */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <UrgencyTimer />
            <h2 className="text-4xl font-bold mt-6">Expert Verdicts: Top Picks Today</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
              We've spent 2,400+ hours testing these products to ensure they deliver exactly what they promise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRODUCTS.map(product => (
              <div 
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-2xl transition-all group"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {product.badges?.map(badge => (
                      <span key={badge} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#1E90FF] border border-[#1E90FF]/20 shadow-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-1 text-[#FFB800] mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                    ))}
                    <span className="text-gray-400 text-xs ml-2 font-bold">{product.reviewCount.toLocaleString()} Verified Reviews</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div>
                      <span className="text-3xl font-black text-[#333333]">${product.price}</span>
                      <p className="text-xs text-green-600 font-bold uppercase tracking-widest">In Stock - Ships Fast</p>
                    </div>
                    <button 
                      onClick={() => onNavigate(PageType.REVIEW, product.id)}
                      className="bg-[#333333] hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all"
                    >
                      Read Full Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Builders */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E90FF] rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CheckCircle2 size={300} strokeWidth={1} />
          </div>
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">Our Integrity is Our Only Inventory.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-xl mb-2">100% In-House Testing</h4>
                <p className="text-white/80 leading-relaxed">We buy every product we review. No freebies, no bias, just raw data and real experience.</p>
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Verified Experts</h4>
                <p className="text-white/80 leading-relaxed">Our team consists of engineers, former chefs, and certified fitness trainers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
