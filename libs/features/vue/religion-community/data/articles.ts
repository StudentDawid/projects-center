export interface Article {
  id: number
  title: string
  excerpt: string
  tag: string
  date: string
  image: string
  category: string
  content: Array<{
    type: 'paragraph' | 'quote'
    text: string
  }>
}

export const articlesData: Article[] = [
  {
    id: 1,
    title: 'Weekly Youth Service: Strengthening Our Faith Together',
    excerpt: 'Every Friday evening, the halls of Sacred Heart resonate with a different kind of energy.',
    tag: 'Events',
    date: 'October 15, 2023',
    category: 'EVENTS',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV',
    content: [
      {
        type: 'paragraph',
        text: 'Every Friday evening, the halls of Sacred Heart resonate with a different kind of energy. It\'s an energy fueled by the curiosity, passion, and vibrant faith of our younger generation. Our Weekly Youth Service has grown into a cornerstone of our community life, offering a space where young adults can explore their spirituality in a language that speaks to their unique experiences.'
      },
      {
        type: 'paragraph',
        text: 'The service begins with a contemporary worship session, blending traditional themes with modern musical arrangements that invite everyone to participate. This is followed by a message specifically crafted to address the challenges faced by youth in today\'s fast-paced world—from navigating social pressures to finding meaning in their career paths and relationships.'
      },
      {
        type: 'quote',
        text: '"Our goal is not just to teach tradition, but to show how tradition provides a solid foundation for a modern, purposeful life."'
      },
      {
        type: 'paragraph',
        text: 'Beyond the sermon and music, the service emphasizes community connection. After the formal program, we gather in the community hall for light refreshments and small-group discussions. These informal sessions are where deep friendships are forged and where the real questions are asked and explored without judgment.'
      },
      {
        type: 'paragraph',
        text: 'Whether you are a lifelong member of our community or someone simply looking for a place to belong, we invite you to join us this coming Friday. Come as you are, bring your questions, and discover a community that is ready to walk alongside you on your journey.'
      }
    ]
  },
  {
    id: 2,
    title: 'Monthly Community Outreach Program',
    excerpt: 'Our commitment to serving extends beyond our walls, into the heart of our city.',
    tag: 'Outreach',
    date: 'October 8, 2023',
    category: 'OUTREACH',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p',
    content: [
      {
        type: 'paragraph',
        text: 'Our commitment to serving extends beyond our walls, into the heart of our city. The Monthly Community Outreach Program is our way of living out the values we cherish—compassion, justice, and unconditional love.'
      },
      {
        type: 'paragraph',
        text: 'This month, we are focusing on food security for families in need. Our volunteers will be distributing nutritious meals and sharing resources for long-term food assistance.'
      },
      {
        type: 'quote',
        text: '"To love one\'s enemies and to love one\'s neighbor as oneself is a project that we can all undertake."'
      },
      {
        type: 'paragraph',
        text: 'Volunteers of all ages are welcome. Whether you can help for an hour or the entire day, your contribution makes a difference in someone\'s life.'
      }
    ]
  },
  {
    id: 3,
    title: 'Interfaith Dialogue: Shared Wisdom',
    excerpt: 'In a world of increasing division, we believe in the power of dialogue across faith traditions.',
    tag: 'Spiritual',
    date: 'September 30, 2023',
    category: 'SPIRITUAL',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB05OLbyQKju26CN474KAUqmnn3yZpsWZ7XWrYNRC0AcNmw6g11ZmVGJU6ziOY6DGmq8SfXtCK-EKXGB6qxpB8ccFvYL58KNvQ3-I1-XUC5wOrBs1eBxPaydJfh0goPK363WGybdPEkwV3AbgrBWniaY7ax_ClG9sNSmQxSVmj-9iOmq2pG8t1ExiyAOMJWHd3fBj98a7upDAvDTIZLm-EYLYJkstHnj0uzH_YlekOM1p_M1LsV1qYIxQcn-DcztPeHHDXyVMNuOd-z',
    content: [
      {
        type: 'paragraph',
        text: 'In a world of increasing division, we believe in the power of dialogue across faith traditions. Our Interfaith Dialogue series brings together leaders and members from various faith communities to explore our shared values and unique perspectives.'
      },
      {
        type: 'paragraph',
        text: 'This gathering is not about converting anyone or proving one tradition superior to another. Instead, it\'s about deepening mutual understanding and discovering the common ground that unites us as human beings.'
      },
      {
        type: 'quote',
        text: '"We may have different religions, different languages, different colored skin, but we all belong to one human family."'
      },
      {
        type: 'paragraph',
        text: 'Join us as we engage in respectful conversation with Rabbi David Cohen and Imam Ahmed Hassan about wisdom, compassion, and service in our faith traditions.'
      }
    ]
  },
  {
    id: 4,
    title: 'New Sunday School Sessions Begin',
    excerpt: 'We are excited to announce the start of our new Sunday school sessions for children and teens.',
    tag: 'Updates',
    date: 'September 25, 2023',
    category: 'UPDATES',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV',
    content: [
      {
        type: 'paragraph',
        text: 'We are excited to announce the start of our new Sunday school sessions for children and teens. This year, we\'ve redesigned our curriculum to be more engaging and relevant to the lives of our young people.'
      },
      {
        type: 'paragraph',
        text: 'Classes are now held in age-specific groups: Children (ages 5-8), Tweens (ages 9-12), and Teens (ages 13-17). Each group explores scripture, discusses real-world issues, and learns what it means to live out their faith.'
      },
      {
        type: 'quote',
        text: '"Train up a child in the way they should go; even when old, they will not depart from it."'
      },
      {
        type: 'paragraph',
        text: 'Registration is open now! Sessions begin every Sunday at 9:30 AM. Space is limited, so please sign up soon.'
      }
    ]
  },
  {
    id: 5,
    title: 'Christmas Giving Campaign: Spreading Joy',
    excerpt: 'This holiday season, we invite you to be part of our mission to bring joy to those in need.',
    tag: 'Events',
    date: 'September 20, 2023',
    category: 'EVENTS',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p',
    content: [
      {
        type: 'paragraph',
        text: 'This holiday season, we invite you to be part of our mission to bring joy to those in need. Our Christmas Giving Campaign focuses on providing gifts, meals, and essential supplies to families in our community.'
      },
      {
        type: 'paragraph',
        text: 'Sponsorship options include gift cards, toy packages, or donation baskets. You can participate as an individual, family, or group.'
      },
      {
        type: 'quote',
        text: '"It is more blessed to give than to receive."'
      },
      {
        type: 'paragraph',
        text: 'Sign up today and make this Christmas unforgettable for a family in need. Donations are due by November 30th.'
      }
    ]
  },
  {
    id: 6,
    title: 'Our New Prayer Garden: A Space for Reflection',
    excerpt: 'We are thrilled to unveil our newly renovated prayer garden, a serene space designed for quiet reflection.',
    tag: 'Updates',
    date: 'September 15, 2023',
    category: 'UPDATES',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB05OLbyQKju26CN474KAUqmnn3yZpsWZ7XWrYNRC0AcNmw6g11ZmVGJU6ziOY6DGmq8SfXtCK-EKXGB6qxpB8ccFvYL58KNvQ3-I1-XUC5wOrBs1eBxPaydJfh0goPK363WGybdPEkwV3AbgrBWniaY7ax_ClG9sNSmQxSVmj-9iOmq2pG8t1ExiyAOMJWHd3fBj98a7upDAvDTIZLm-EYLYJkstHnj0uzH_YlekOM1p_M1LsV1qYIxQcn-DcztPeHHDXyVMNuOd-z',
    content: [
      {
        type: 'paragraph',
        text: 'We are thrilled to unveil our newly renovated prayer garden, a serene space designed for quiet reflection and meditation. The garden features native plants, walking paths, and peaceful seating areas.'
      },
      {
        type: 'paragraph',
        text: 'Whether you need a moment of solitude, a place to pray, or simply a sanctuary away from the hustle and bustle of daily life, our prayer garden is open to all community members.'
      },
      {
        type: 'quote',
        text: '"In quietness and in confidence shall be your strength."'
      },
      {
        type: 'paragraph',
        text: 'The garden is open daily from sunrise to sunset. We also host guided meditation walks every Wednesday at 6 PM.'
      }
    ]
  }
]
