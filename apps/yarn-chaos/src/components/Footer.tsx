import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#1a120e] border-t border-[#f4f1f0] dark:border-[#3a2d28] py-10 px-4 md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-[#181311] dark:text-white">
          <div className="size-6 text-primary">
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
          <span className="font-bold text-lg">Knits & Knots</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <a className="hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Shipping & Returns
          </a>
        </div>
        <p className="text-sm text-gray-400">
          © 2023 Knits & Knots. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
