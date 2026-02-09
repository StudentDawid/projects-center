export interface CalendarEvent {
  id: number
  title: string
  category: 'EVENTS' | 'OUTREACH' | 'SPIRITUAL' | 'UPDATES'
  date: string // "2023-10-08"
  time: string // "7:00 PM", "8:00 AM"
  dayOfWeek: string // "Fri", "Sat"
  description: string
  image: string
}

export const eventsData: CalendarEvent[] = [
  {
    id: 1,
    title: 'Youth Service',
    category: 'EVENTS',
    date: '2023-10-13',
    dayOfWeek: 'Fri',
    time: '7:00 PM',
    description: 'Weekly gathering for fellowship and spiritual growth.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV'
  },
  {
    id: 2,
    title: 'Community Outreach',
    category: 'OUTREACH',
    date: '2023-10-14',
    dayOfWeek: 'Sat',
    time: '8:00 AM',
    description: 'Supporting local families with food and resources.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p'
  },
  {
    id: 3,
    title: 'Prayer Group',
    category: 'SPIRITUAL',
    date: '2023-10-11',
    dayOfWeek: 'Wed',
    time: '6:00 PM',
    description: 'Join us for a peaceful hour of meditation and prayer.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtrxp3Jdo15sPAqG5UbT9xMYQbaABkhIcN9TDnr168DuT7_LClZ5gvKSTMdhCX6_oNtP8U2nYw7q9Hjfx2Rk5RXdy31irYGFS6CzY5GIvaw_8_phfTZEMDV2uDEgiju-eSfI0AFz1N_A1F5vjqZYenbpIjeF6b7DPLovLAFEpzHjEU9gAIm5D8H_xZrqyd7Wprc238f-Cw7Z7PcvI8GCPWw6VkXX04vCA8CksIONQX8MGVkO5ELGmszlhRlk6FCKjfbG9i40SvytmD'
  },
  {
    id: 4,
    title: 'Sunday Service',
    category: 'EVENTS',
    date: '2023-10-08',
    dayOfWeek: 'Sun',
    time: '10:00 AM',
    description: 'Join us for our main weekly worship service.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV'
  },
  {
    id: 5,
    title: 'Bible Study',
    category: 'SPIRITUAL',
    date: '2023-10-20',
    dayOfWeek: 'Fri',
    time: '7:30 PM',
    description: 'In-depth study of this month\'s scripture readings.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB05OLbyQKju26CN474KAUqmnn3yZpsWZ7XWrYNRC0AcNmw6g11ZmVGJU6ziOY6DGmq8SfXtCK-EKXGB6qxpB8ccFvYL58KNvQ3-I1-XUC5wOrBs1eBxPaydJfh0goPK363WGybdPEkwV3AbgrBWniaY7ax_ClG9sNSmQxSVmj-9iOmq2pG8t1ExiyAOMJWHd3fBj98a7upDAvDTIZLm-EYLYJkstHnj0uzH_YlekOM1p_M1LsV1qYIxQcn-DcztPeHHDXyVMNuOd-z'
  },
  {
    id: 6,
    title: 'Children\'s Craft Hour',
    category: 'EVENTS',
    date: '2023-10-15',
    dayOfWeek: 'Sun',
    time: '11:30 AM',
    description: 'Creative activities for children ages 5-10.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_RRvjazX3j1c8d-EC4bfBb21aXwv4oGLdzc1UQvbgzVR9uGPuttXUnpG9kWqTpMkJSYOe5ECHgMDhkqdnhqpInWOdirTAKH9sZKdLNoF6Tjxuv3uOTBfTECmTMOo-kgR20oZDywlJ9HWC0VX3dv4Ii05W7Jb_dFcaD9NMID-VBg0u4Bce5bpkXha8uBcmQRUpo0mUEM_fBSqpQwpW4MlEsigrkD9o-9V_6nJZpXO7dXdzJfUgOWir6DgaBX6YlztlcAKaOILG9tHZ'
  }
]
