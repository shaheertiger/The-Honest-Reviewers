
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ReviewPage } from './pages/ReviewPage';
import { BestOfPage } from './pages/BestOfPage';
import { PageType } from './types';
import { PRODUCTS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.HOME);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, selectedProductId]);

  const handleNavigate = (page: PageType, id?: string) => {
    setCurrentPage(page);
    if (id) setSelectedProductId(id);
  };

  const renderPage = () => {
    switch (currentPage) {
      case PageType.HOME:
        return <Home onNavigate={handleNavigate} />;
      case PageType.REVIEW:
        const product = PRODUCTS.find(p => p.id === selectedProductId) || PRODUCTS[0];
        return <ReviewPage product={product} />;
      case PageType.BEST_OF:
        return <BestOfPage onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  const getStickyCta = () => {
    if (currentPage === PageType.REVIEW && selectedProductId) {
      const p = PRODUCTS.find(p => p.id === selectedProductId);
      return { text: `Check Price on Amazon →`, link: p?.amazonUrl || '#' };
    }
    if (currentPage === PageType.BEST_OF) {
      return { text: `View Today's #1 Pick →`, link: PRODUCTS[0].amazonUrl };
    }
    return undefined;
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={handleNavigate}
      stickyCta={getStickyCta()}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
