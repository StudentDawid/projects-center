import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="px-4 py-6 md:px-10 lg:px-20 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-xl bg-cover bg-center min-h-[500px] lg:min-h-[600px] flex flex-col justify-end p-8 md:p-12 lg:p-16 group"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCONh1mvtvCSEBSz56AffdFubXClmQDetPB-Lrl78ukoCVynKaiyW-wuCuwungoYAoR2jYf2zZHgk5UFV_cwK4KVRvMD_E_jgG2HiIHT2oXREJhUHUOiaKdcw-vwzbpWVa_7KzNT-D8DTjNJtqyYllu7DKo_gstP9sExe4giMKwvp3f9GiEE8EXZ4hVapoDMI46a7-koF-FRznBzo2BI01QpOw4dKqv3yo8fKJnBOmb1eAfQwQ9f4REr5KLPIGl3N7n2-lIayW7wso")',
          }}
        >
          <div className="relative z-10 max-w-2xl animate-fade-in-up">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4 drop-shadow-lg">
              Handmade with love,
              <br />
              stitch by stitch.
            </h1>
            <p className="text-white/90 text-base md:text-lg lg:text-xl font-medium mb-8 max-w-lg shadow-black drop-shadow-md">
              Discover cozy crochet toys, bespoke sweaters, and patterns made
              for warmth and comfort in every season.
            </p>
            <button className="inline-flex h-12 md:h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Shop Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
