import React from 'react';
import ProductCard from './ProductCard';

const products = [
  {
    title: 'Cuddly Bear Plushie',
    price: '$45.00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdNfqP4t4YyWIUH-S465aZnADV4wWkSk8u1U1lcseolT9W_n7MO6MzAosbunwFNIQrXdReyJa0qKZFPoaae_muTX0-GZqg1fonYp7nqC1KKArhmSfSPQ-NmrnUAQfLKTq8KF-XdaKbHGem47AEHGqiqXkESHDjULyzvWBgdTaa_cD20PcuCotjGT09BOcNU8Xx3zd4J0cyoW5Ximusb9oqyE2ELdoDWEPmGNhRZKDWPOK9uhAx7QyuYlKV9-UnPUjequtVcgYOgAw',
    description:
      'Hand-knitted with organic cotton yarn, perfect for baby showers and cozy nights.',
  },
  {
    title: 'Merino Wool Sweater',
    price: '$120.00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEdANCHPQpM-P9ZEyHR30aWIjbFpuaD7OSuntQBZ4VOd9-dcguYKqJWfKuiC_eZBCp2xMxHkoQLhUHvOxDC7X4uTlIdjQEpfI90bYfbgJa22mZkii1UrSIYny0ELKZrmpRVrBUsJtvquCYcQ_ap7mcPplCa4oS7Lgs_nBvTklg8nPXJKvTZj27NNhOssYe67Er8dHh_gNdROfP1WZ4u-SRpTO1rRvTY9L5fOaQScW-acZBIve1QlmXbSVH0MMZLTmHn_HXzc2pxwc',
    description:
      'Luxuriously soft merino wool sweater in a classic cable knit pattern.',
  },
  {
    title: 'Pastel Baby Blanket',
    price: '$65.00',
    oldPrice: '$85.00',
    sale: 'Sale',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBChT1w4Qw0LQOsixGMCUOxs8JDyJFXs2fFrDZlDX7v_fiKQxW5TY6FRCIpwjqvGGHcRA9xP44uiz3twMPHVDhDOxvOuCFnaa6AAiLiPmEQkHe-jPZC7iLbu5RYVEB1jVWTU0Y1aCvUqk8NkOZzVxZGi5uBegLUdP-ksaOKITdBcG_5rdfXR-ZsRZsdpbVDEFt8RtC_cpdnt7gzeMN8QvP2QRFUIT6pJmk3bQieTvdWQcQHqSEo16nOS-XJqqmsgmwaxNk3QVQ-vcw',
    description:
      'Soft pastel colors woven into a durable, washable baby blanket.',
  },
];

const ProductGrid: React.FC = () => {
  return (
    <section id="shop">
      <div className="px-4 md:px-10 lg:px-20 pt-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#f4f1f0] dark:border-[#3a2d28]">
          <div>
            <span className="text-primary font-bold text-sm tracking-wider uppercase mb-1 block">
              New Arrivals
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#181311] dark:text-white">
              Featured Cuddles
            </h2>
          </div>
          <a
            className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all"
            href="#"
          >
            View all products{' '}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </a>
        </div>
      </div>

      <div className="px-4 md:px-10 lg:px-20 py-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <ProductCard key={i} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
