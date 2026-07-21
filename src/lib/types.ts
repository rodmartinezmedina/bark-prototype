export type Category = {
  id: string;
  label: string;
  specialtyLabel: string;
  specialties: string[];
};

export type ProState = "reviewed" | "no-reviews" | "new";

export type Pro = {
  id: string;
  category: string;
  name: string;
  verified: boolean;
  state: ProState;
  rating: number | null;
  reviews: number;
  topMatch: boolean;
  location: string;
  distance: number;
  hires: number;
  years: number;
  responseMins: number;
  priceVal: number;
  priceUnit: string;
  specialties: string[];
  bio: string;
  why: string[];
  initials: string;
  color: string;
};

export type Data = {
  categories: Category[];
  professionals: Pro[];
};
