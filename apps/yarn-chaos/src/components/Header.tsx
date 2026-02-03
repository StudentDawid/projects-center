import React from 'react';

interface HeaderProps {
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartCount }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-b-[#f4f1f0] dark:border-b-[#3a2d28] bg-white/95 dark:bg-[#1a120e]/95 backdrop-blur-sm px-6 py-4 md:px-10 lg:px-20">
      <div className="flex items-center gap-4 text-[#181311] dark:text-white">
        <div className="size-8 text-primary">
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">
          Knits & Knots
        </h2>
      </div>

      <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
        <nav className="flex items-center gap-8 text-[#181311] dark:text-white">
          <a
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#"
          >
            Home
          </a>
          <a
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#portfolio"
          >
            Portfolio
          </a>
          <a
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#shop"
          >
            Shop
          </a>
          <a
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#contact"
          >
            Contact
          </a>
        </nav>
        <button className="flex items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-md">
          <span className="truncate flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              shopping_bag
            </span>
            Cart ({cartCount})
          </span>
        </button>
      </div>

      <button className="md:hidden p-2 text-[#181311] dark:text-white">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </header>
  );
};

export default Header;
