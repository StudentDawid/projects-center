import React from 'react';

const Contact: React.FC = () => {
  return (
    <section className="py-16 px-4 md:px-10 lg:px-20" id="contact">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-white dark:bg-[#1a120e] p-8 rounded-3xl shadow-lg border border-[#f4f1f0] dark:border-[#3a2d28]">
            <h2 className="text-3xl font-bold mb-2 text-[#181311] dark:text-white">
              Get in Touch
            </h2>
            <p className="text-gray-500 mb-6">
              Have a custom commission in mind or questions about an order?
            </p>
            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#181311] dark:text-white">
                    First Name
                  </label>
                  <input
                    className="rounded-lg border-gray-200 bg-background-light dark:bg-background-dark/50 dark:border-gray-700 p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Jane"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#181311] dark:text-white">
                    Last Name
                  </label>
                  <input
                    className="rounded-lg border-gray-200 bg-background-light dark:bg-background-dark/50 dark:border-gray-700 p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Doe"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#181311] dark:text-white">
                  Email
                </label>
                <input
                  className="rounded-lg border-gray-200 bg-background-light dark:bg-background-dark/50 dark:border-gray-700 p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="jane@example.com"
                  type="email"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#181311] dark:text-white">
                  Message
                </label>
                <textarea
                  className="rounded-lg border-gray-200 bg-background-light dark:bg-background-dark/50 dark:border-gray-700 p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Tell me about your idea..."
                  rows={4}
                ></textarea>
              </div>
              <button
                className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl bg-primary py-3 text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                type="button"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-[#181311] dark:text-white">
                Visit Our Studio
              </h3>
              <div className="bg-white dark:bg-[#1a120e] p-1 rounded-2xl shadow-sm overflow-hidden mb-6">
                <div
                  className="w-full aspect-video rounded-xl bg-cover bg-center"
                  style={{
                    backgroundImage: 'url("https://placeholder.pics/svg/300")',
                  }}
                ></div>
              </div>
              <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    location_on
                  </span>
                  <p>123 Yarn Street, Craftsville, CA 90210</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    mail
                  </span>
                  <p>hello@knitsandknots.com</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/10 dark:bg-primary/5 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 text-[#181311] dark:text-white">
                Join the Knitting Circle
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Subscribe for free patterns, shop updates, and exclusive
                discounts.
              </p>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border-none bg-white dark:bg-[#2a1d18] p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="Email address"
                  type="email"
                />
                <button className="bg-primary text-white rounded-lg px-4 py-2 font-bold text-sm hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
