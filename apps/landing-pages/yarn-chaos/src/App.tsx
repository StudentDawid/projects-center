import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Portfolio from './components/Portfolio';
import InstagramGrid from './components/InstagramGrid';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col overflow-x-hidden transition-all duration-700`}
    >
      <Header cartCount={cartCount} />
      <main className="flex-1">
        <Hero />
        <ProductGrid />
        <Portfolio />
        <InstagramGrid />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
