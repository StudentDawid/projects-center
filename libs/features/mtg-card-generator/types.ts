export interface RpgCard {
  id: string;
  name: string;
  type: string;
  subType?: string;
  cost?: string; // e.g. "50gp", "3 AP"
  colorTheme: string; // Hex code or preset
  description: string;
  flavorText?: string;
  imageUrl?: string;
  stats: { label: string; value: string }[]; // e.g. [{label: "Range", value: "30ft"}]
  tags: string[];
}
