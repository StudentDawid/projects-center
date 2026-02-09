export interface GalleryPhoto {
  id: number;
  alt: string;
  src: string;
  tall?: boolean;
  wide?: boolean;
}

export interface Gallery {
  id: number;
  title: string;
  date: string;
  dateRange: string;
  description: string;
  category: string;
  photos: GalleryPhoto[];
}

export const galleriesData: Gallery[] = [
  {
    id: 1,
    title: "Youth Retreat 2023",
    date: "August 12-14, 2023",
    dateRange: "August 12-14, 2023",
    description:
      "A weekend of reflection, team building, and spiritual renewal at the mountain campsite. Our community's youth explored their faith amidst the beauty of nature and the warmth of fellowship.",
    category: "Youth",
    photos: [
      {
        id: 1,
        alt: "Campfire gathering",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV",
        tall: true,
      },
      {
        id: 2,
        alt: "Mountain hiking",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_RRvjazX3j1c8d-EC4bfBb21aXwv4oGLdzc1UQvbgzVR9uGPuttXUnpG9kWqTpMkJSYOe5ECHgMDhkqdnhqpInWOdirTAKH9sZKdLNoF6Tjxuv3uOTBfTECmTMOo-kgR20oZDywlJ9HWC0VX3dv4Ii05W7Jb_dFcaD9NMID-VBg0u4Bce5bpkXha8uBcmQRUpo0mUEM_fBSqpQwpW4MlEsigrkD9o-9V_6nJZpXO7dXdzJfUgOWir6DgaBX6YlztlcAKaOILG9tHZ",
      },
      {
        id: 3,
        alt: "Starlit prayer",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB05OLbyQKju26CN474KAUqmnn3yZpsWZ7XWrYNRC0AcNmw6g11ZmVGJU6ziOY6DGmq8SfXtCK-EKXGB6qxpB8ccFvYL58KNvQ3-I1-XUC5wOrBs1eBxPaydJfh0goPK363WGybdPEkwV3AbgrBWniaY7ax_ClG9sNSmQxSVmj-9iOmq2pG8t1ExiyAOMJWHd3fBj98a7upDAvDTIZLm-EYLYJkstHnj0uzH_YlekOM1p_M1LsV1qYIxQcn-DcztPeHHDXyVMNuOd-z",
      },
      {
        id: 4,
        alt: "Group breakfast",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p",
        wide: true,
      },
      {
        id: 5,
        alt: "Morning service",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtrxp3Jdo15sPAqG5UbT9xMYQbaABkhIcN9TDnr168DuT7_LClZ5gvKSTMdhCX6_oNtP8U2nYw7q9Hjfx2Rk5RXdy31irYGFS6CzY5GIvaw_8_phfTZEMDV2uDEgiju-eSfI0AFz1N_A1F5vjqZYenbpIjeF6b7DPLovLAFEpzHjEU9gAIm5D8H_xZrqyd7Wprc238f-Cw7Z7PcvI8GCPWw6VkXX04vCA8CksIONQX8MGVkO5ELGmszlhRlk6FCKjfbG9i40SvytmD",
      },
      {
        id: 6,
        alt: "Singing workshop",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuALZBlPzNWSJ2ya2gMqr_4lsEE7JkrlpJt1joNFb4KjSsojSVMvsNEpNIpbgHMyqCpiCWX119OlvFwzi6uB3hS5qrt2zGIh73kA5aq7fC-6WVhsaCZAJv9SRQnqGuvGejcVs6tKLZbr6e4IYdYsxArEkLzPWO3eqzREngL7kNDfLe8O_fPKWwH-krJ7xVQZ8E_JJotE53hgukKY7i0Y5giNLT7-5sRk67ZPFdsWDX5cu1IExhi6saFn3j_Efccu7Uy0hZhVANgNuUNC",
        tall: true,
      },
      {
        id: 7,
        alt: "Wildflowers on trail",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB05OLbyQKju26CN474KAUqmnn3yZpsWZ7XWrYNRC0AcNmw-g11ZmVGJU6ziOY6DGmq8SfXtCK-EKXGB6qxpB8ccFvYL58KNvQ3-I1-XUC5wOrBs1eBxPaydJfh0goPK363WGybdPEkwV3AbgrBWniaY7ax_ClG9sNSmQxSVmj-9iOmq2pG8t1ExiyAOMJWHd3fBj98a7upDAvDTIZLm-EYLYJkstHnj0uzH_YlekOM1p_M1LsV1qYIxQcn-DcztPeHHDXyVMNuOd-z",
      },
      {
        id: 8,
        alt: "Closing circle",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV",
      },
      {
        id: 9,
        alt: "Shared meal",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p",
      },
      {
        id: 10,
        alt: "Volunteer session",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV",
        tall: true,
      },
      {
        id: 11,
        alt: "Craft workshop",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p",
      },
      {
        id: 12,
        alt: "Group photo",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtrxp3Jdo15sPAqG5UbT9xMYQbaABkhIcN9TDnr168DuT7_LClZ5gvKSTMdhCX6_oNtP8U2nYw7q9Hjfx2Rk5RXdy31irYGFS6CzY5GIvaw_8_phfTZEMDV2uDEgiju-eSfI0AFz1N_A1F5vjqZYenbpIjeF6b7DPLovLAFEpzHjEU9gAIm5D8H_xZrqyd7Wprc238f-Cw7Z7PcvI8GCPWw6VkXX04vCA8CksIONQX8MGVkO5ELGmszlhRlk6FCKjfbG9i40SvytmD",
        wide: true,
      },
    ],
  },
  {
    id: 2,
    title: "Easter Celebration",
    date: "April 9, 2023",
    dateRange: "April 9, 2023",
    description:
      "Commemorating the joy of the resurrection with our traditional sunrise service and family brunch. A celebration of faith, community, and renewal.",
    category: "Celebration",
    photos: [
      {
        id: 1,
        alt: "Sunlight in sanctuary",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtrxp3Jdo15sPAqG5UbT9xMYQbaABkhIcN9TDnr168DuT7_LClZ5gvKSTMdhCX6_oNtP8U2nYw7q9Hjfx2Rk5RXdy31irYGFS6CzY5GIvaw_8_phfTZEMDV2uDEgiju-eSfI0AFz1N_A1F5vjqZYenbpIjeF6b7DPLovLAFEpzHjEU9gAIm5D8H_xZrqyd7Wprc238f-Cw7Z7PcvI8GCPWw6VkXX04vCA8CksIONQX8MGVkO5ELGmszlhRlk6FCKjfbG9i40SvytmD",
      },
      {
        id: 2,
        alt: "Choir singing",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuALZBlPzNWSJ2ya2gMqr_4lsEE7JkrlpJt1joNFb4KjSsojSVMvsNEpNIpbgHMyqCpiCWX119OlvFwzi6uB3hS5qrt2zGIh73kA5aq7fC-6WVhsaCZAJv9SRQnqGuvGejcVs6tKLZbr6e4IYdYsxArEkLzPWO3eqzREngL7kNDfLe8O_fPKWwH-krJ7xVQZ8E_JJotE53hgukKY7i0Y5giNLT7-5sRk67ZPFdsWDX5cu1IExhi6saFn3j_Efccu7Uy0hZhVANgNuUNC",
        tall: true,
      },
      {
        id: 3,
        alt: "Spring flowers",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB05OLbyQKju26CN474KAUqmnn3yZpsWZ7XWrYNRC0AcNmw-g11ZmVGJU6ziOY6DGmq8SfXtCK-EKXGB6qxpB8ccFvYL58KNvQ3-I1-XUC5wOrBs1eBxPaydJfh0goPK363WGybdPEkwV3AbgrBWniaY7ax_ClG9sNSmQxSVmj-9iOmq2pG8t1ExiyAOMJWHd3fBj98a7upDAvDTIZLm-EYLYJkstHnj0uzH_YlekOM1p_M1LsV1qYIxQcn-DcztPeHHDXyVMNuOd-z",
      },
      {
        id: 4,
        alt: "Family gathering",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV",
      },
    ],
  },
  {
    id: 3,
    title: "Neighbors Helping Neighbors",
    date: "June 10, 2023",
    dateRange: "June 10, 2023",
    description:
      "Our community coming together for the annual city-wide clean-up and food distribution drive. Making a difference in our neighborhood.",
    category: "Service",
    photos: [
      {
        id: 1,
        alt: "Food distribution",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p",
      },
      {
        id: 2,
        alt: "Volunteers working",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV",
      },
      {
        id: 3,
        alt: "Helping hands",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p",
      },
      {
        id: 4,
        alt: "Finished project",
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtrxp3Jdo15sPAqG5UbT9xMYQbaABkhIcN9TDnr168DuT7_LClZ5gvKSTMdhCX6_oNtP8U2nYw7q9Hjfx2Rk5RXdy31irYGFS6CzY5GIvaw_8_phfTZEMDV2uDEgiju-eSfI0AFz1N_A1F5vjqZYenbpIjeF6b7DPLovLAFEpzHjEU9gAIm5D8H_xZrqyd7Wprc238f-Cw7Z7PcvI8GCPWw6VkXX04vCA8CksIONQX8MGVkO5ELGmszlhRlk6FCKjfbG9i40SvytmD",
      },
    ],
  },
];
