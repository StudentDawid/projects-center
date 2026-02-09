export interface Bulletin {
  id: number;
  date: string;
  isLatest?: boolean;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  size: string;
  format: string;
  icon: string;
}

export const bulletinsData: Bulletin[] = [
  {
    id: 1,
    date: "October 29, 2023",
    isLatest: true,
  },
  {
    id: 2,
    date: "October 22, 2023",
  },
  {
    id: 3,
    date: "October 15, 2023",
  },
  {
    id: 4,
    date: "October 08, 2023",
  },
];

export const documentsData: Document[] = [
  {
    id: 1,
    title: "Community Guidelines 2023",
    description: "Rules and code of conduct for our community members.",
    size: "1.2 MB",
    format: "PDF",
    icon: "description",
  },
  {
    id: 2,
    title: "Mission Statement",
    description: "Our core values, vision, and spiritual objectives.",
    size: "450 KB",
    format: "PDF",
    icon: "auto_awesome",
  },
  {
    id: 3,
    title: "Event Registration Forms",
    description: "Standard form for upcoming seasonal festivals and workshops.",
    size: "820 KB",
    format: "DOCX",
    icon: "app_registration",
  },
  {
    id: 4,
    title: "Volunteer Handbook",
    description: "Essential information for those serving in our various ministries.",
    size: "2.1 MB",
    format: "PDF",
    icon: "volunteer_activism",
  },
];
