import React, { useEffect, useState } from 'react';

const FALLBACK_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBOUXKBnMvT8v1VrM9_cLak8yfZ0aYji9eGv7-JHYpkS5EL956ykdiNxnRqOwpJGiAyZcvxqdB5I4q1xqVUm7TnzYHmyvdUZtO8QD8FJeLC-Yb_FvVe1lkjX441xelMiyvaemNSq15hEsNFEy0Dr4M835QOVccLfyQinvCIt5XHUpyRWnI_90RbP1cneajlZiE35-9wP8sSkuU_lghg83kbl0xyfWYsNKzD_mcwMc1t8ocE3Eq9bkFYpLkR1KG1RHeh0flLGuyhW7c',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBqIjf279ROGb3UAhRpFGWMaBJSnW8xvjfXViyoapx79CMlzalaA4VgVvE_1gTFFGplpw1hBrH-dxU_3YVoahqQZTrvdKw4ojEkD8KKQIHQxfoTyFTXr7lftpYj-wOjUOe4MyWDgjQ6MDgTdkInbOIm2A08gFnfvub-1T3ble3BrwM0LMmenAh8spyAncO-9MWzfjYuHpnlMQY1OQ-yUl8ZWovnf-jh7vPuErekXFe3cTcOs3t4U8xCrZj98IAwC9zwvw2yr2kpm_4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAJTuNP4fbRwR2TXiRICILYW0USz_gLac3MfYdDc_sdQiRXYB0ylmh-8GDywSJ70LwPPEUgSeSLKnOzFXuYCpegr-sxXn9BTkRcQbutl_0zh3XgaPG7K4dJnOg2lh-qxhgdQYrSz3LeouhbCnTyObd5LscSoIjApvTKHRpwQ6aXNgSCLD3cieKiqIXyFfsbhlbBpWvwpqqs9lu7KlCnitUldDGB60v93_pBAhTUF3kAPmoD6_Bp7DYraLLq4rTDfTyO3gkm05n6FsE',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4jZ7NThjrYKRLt-KunmdzHjzDT2Z3SI6Dymu8bQwTHmK1vSqPTu6r41wDfViYKjlLKT_0jM_lsiL2Bb8YU4u_PYrNbTemWMKR20oqmYvVB94bSFIa31CKYX7-Maf6CcmP-eIMNMAXE6mC7a_ImZGmMN04eM8tYkPZduKrhXEGsEOF253SSQZZSpq1M4yha5GPssLME7qYSPBTqRAgaGyLLvuffn_xdYvqfEnyf6TBOQ1dPmD-yygcxzDfGVxSuDDcnas4KhkLeUI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBWPROHx8dGMqq3kLXDeSRqTww2UwXmU0l4aE4bES_f3mIz3B-O5i50KfZVHLksxhITKPB8VLNK6R0y5v-qL-XqQceSBs_dPTcBACBpviJ8uj5DLERlVGFh4C1x6XYEGiGQbBVD76O1XWSFqfRlwBefiRdvwsTQJbcMqDOJuPmkaEYYc5Up-ijjq5N_mbrcFunYSlqvoeF93Y7ovSpjVqsivtOJvaip-5soXYwwAQOi_67TYLDzxK-tInf91oBKzRsYzu59VXUf5lI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9JaPNuhgxttbvFtsJfyhC0qvkqOxEh14wJcBJGyNlC3j48q0BQGxFsD3xqLdRyPjf99zGKWdrlNH3VajP-CsQ_pIZJKhlB-VXjQJAyVMzIdE-XNkg5Ui2maNVBvEEXY2LMvuQJJ2LI62EZWM-FBckSDRgVSZqYUChN3g5kv8PM0bwGFF9_Tb_cLS96djLk3akmOzfQUdzJaStGyOkxsjlVv_yX9tPiWbU25DfWNn779KZJPG1G5ysJFaVVJhv7U4e4y9jKP6ZlBc',
];

const InstagramGrid: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstagram = async () => {
      try {
        const profileUrl = 'https://www.instagram.com/wloczkowy_chaos/embed/';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
          profileUrl
        )}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const html = data.contents;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Szukamy obrazków w embedzie Instagrama
        const imgElements = Array.from(doc.querySelectorAll('img')).filter(
          (img) => {
            const src = img.src;
            return (
              src &&
              (src.includes('cdninstagram.com') || src.includes('scontent'))
            );
          }
        );

        const imageUrls = imgElements
          .map((img) => img.src)
          // Usuwamy duplikaty
          .filter((value, index, self) => self.indexOf(value) === index)
          .slice(0, 12);

        if (imageUrls.length > 0) {
          setImages(imageUrls);
        }
      } catch (error) {
        console.error('Error fetching instagram feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagram();
  }, []);

  return (
    <div className="py-16 px-4 md:px-10 lg:px-20 bg-[#f8f6f6] dark:bg-[#221510]">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[#181311] dark:text-white">
            <span className="p-1 bg-gradient-to-tr from-yellow-400 to-purple-600 text-white rounded-lg inline-flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
              </svg>
            </span>
            @wloczkowy_chaos
          </h2>
          <a
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
            href="https://www.instagram.com/wloczkowy_chaos"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow Us{' '}
            <span className="material-symbols-outlined text-sm">
              open_in_new
            </span>
          </a>
        </div>
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}
        >
          {images.map((img, i) => (
            <a
              key={i}
              href="https://www.instagram.com/wloczkowy_chaos"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-cover bg-center rounded-lg hover:opacity-80 transition cursor-pointer shadow-sm hover:shadow-md block overflow-hidden"
              style={{ backgroundImage: `url("${img}")` }}
            >
              <div className="w-full h-full bg-black/0 hover:bg-black/10 transition-colors"></div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstagramGrid;
