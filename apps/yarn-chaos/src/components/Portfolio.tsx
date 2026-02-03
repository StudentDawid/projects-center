import React from 'react';

const Portfolio: React.FC = () => {
  return (
    <section
      className="bg-white dark:bg-[#1a120e] py-16 px-4 md:px-10 lg:px-20 mt-8"
      id="portfolio"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#181311] dark:text-white">
            Made With Passion
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore some of my custom commissions and favorite past projects.
            Each piece tells a story of patience and creativity.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group cursor-pointer">
            <div
              className="w-full h-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA80SgqEdxwO-NMjhhoeAT3m5voPZv1KqiOSUJhiPg427chIB0tNkk_gEJEHOAcs-8fZKEsz_xFv3tvq6I6ZUYlPBVqdEF7N1hkIHVyaBweTOyV63dXcfPxtIyd3dhEC3I-F-o5G15baTJhXmxd07EzNrWAxC69YHqN3KZ_-tmrkTtascL5_7uBFOj0ol9lKZROcnNI97Em0qMegdKWQEgIsIGjk9UDPwDKR8bMYD4msQsFxnKCOgfL8_tadMc-r5UhA5DeIMOyshM")',
              }}
            ></div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <p className="text-white font-bold text-xl">The Process</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden relative group cursor-pointer">
            <div
              className="w-full h-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBwJqS2-el1WmKp_ipfdYpfMSjbFNWWPlPEelvehdYXXUTCJNJrImXcSR0NQ3cBY-bGFKlq7RL2VtC1YQOTmRer7hIfzAFz_fIpSrjP-h_XvjGDiDX8wD1WKBSXCvSw7TKBdCqqj6hagKjb8FMblNEtXoiA_C3qXfYDC3H8NsCmW5Cd0F3aeXNB4fujwFcrmjo-VMemFBkYjdV1oR_9s-McTvLC6XPXwA6QmNzjOIj-1x1LZCNZCFKMnfjw9EC5t8jVrn_s2mjsNQ")',
              }}
            ></div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <p className="text-white font-bold text-sm">Amigurumi</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden relative group cursor-pointer">
            <div
              className="w-full h-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCjsE0GvYkK2GbKsN24GW5cieZq0nw7agIzzAfe3o-B-YZpuutBbkXuQS0q-JWdKXwVpkHeEQV0Lh06f7lqB5IpqO27OQU0zRFEQi6liDiyA66b25hduALLevoaHx_vPcGCtK0CfokEG7ARJeUWJODzrAPCbdjE-l-KJ6jiFZx2lgb0ac9fgQC2sEz7OQBdUjQSQDPEl-ySKZdQ90KM45rWpcck_hU233Qo3VbpE8YXebA0ctAqwo7zFlEm1t8FsPylfVz_76HXusg")',
              }}
            ></div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <p className="text-white font-bold text-sm">Materials</p>
            </div>
          </div>
          <div className="col-span-2 rounded-2xl overflow-hidden relative group cursor-pointer">
            <div
              className="w-full h-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAem46qbQlMSsYZafLcYt8EDm-mxyD1L6xMjWajI-fNIqSq0ipTXa8Y4uWJxrGV67AK3GfOHpwv9GLrafozJrcbrStOiEV1MHfF0QOv1xwgOW2oe7krAjBJoorJbC3iGxN01GmtAhd30sfGAc2fVa1ordkOYQ9l9FGl5YzuWEyfGbBjNMPpC2qMUtmEdYRs4NA4K0bFdtHvphysVattwT0e5KTbiNbkLEuTkVBRWvIMLXfuPDjjJSLbqllezfKlh-XDC1qAWfMCIM8")',
              }}
            ></div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <p className="text-white font-bold text-lg">Detailed Textures</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
