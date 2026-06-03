export type PostType = 'story' | 'garage' | 'review' | 'qa' | 'maintenance' | 'marketplace';

export interface Author {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
  isProUser?: boolean;
}

export interface MarketplaceListingPreview {
  title: string;
  price: string;
  image: string;
}

export interface CommunityPost {
  id: string;
  author: Author;
  content: string;
  image?: string;
  images?: string[];
  video?: string;
  type: PostType;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  category: string;
  tags: string[];
  isBookmarkedInitial?: boolean;
  marketplaceListing?: MarketplaceListingPreview;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
}

export interface VehicleListing {
  id: string;
  image: string;
  images: string[];
  price: string;
  title: string;
  location: string;
  seller: Seller;
  condition: 'New' | 'Used' | 'Project';
  timestamp: string;
  specs: string[];
  category: 'Exotics' | 'Classics' | 'Projects' | 'Daily';
  createdAt: string;
  updatedAt: string;
}

export interface GarageVehicle {
  id: string;
  ownerId: string;
  image: string;
  images: string[];
  title: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}
