import React from 'react';

interface ProductCardProps {
  title: string;
  price: string;
  image: string;
  description: string;
  sale?: string;
  oldPrice?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  image,
  description,
  sale,
  oldPrice,
}) => {
  return (
    <div className="group flex flex-col bg-white dark:bg-[#2a1d18] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f1f0]">
        {sale && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded z-10">
            {sale}
          </span>
        )}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url("${image}")` }}
        ></div>
        <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full text-gray-500 hover:text-red-500 transition-colors z-10">
          <span className="material-symbols-outlined text-[20px]">
            favorite
          </span>
        </button>
      </div>
      <div className="p-5 flex flex-col grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-[#181311] dark:text-white group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex flex-col items-end">
            <span className="font-bold text-lg text-primary">{price}</span>
            {oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                {oldPrice}
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {description}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <button className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-[#181311] dark:bg-white text-white dark:text-[#181311] font-bold text-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">
              shopping_cart
            </span>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
