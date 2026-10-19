export type Role = 'guest' | 'farmer' | 'buyer';

export type Language = 'en' | 'te';

export interface CropPrice {
  id: string;
  cropName: string;
  cropNameTe: string;
  cropKey: 'tomato' | 'rice' | 'cotton' | 'potato' | 'chilli' | 'maize';
  marketName: string;
  marketNameTe: string;
  price: number;
  unit: string;
  changePercent: number;
  isPositive: boolean;
}

export interface MandiComparison {
  id: string;
  marketName: string;
  distanceKm: number;
  marketPrice: number;
  otherCharges: number;
  estimatedNetReturn: number;
  demand: 'High' | 'Medium' | 'Low';
  isRecommended?: boolean;
  cessBreakdown?: {
    mandiCess: number;
    handling: number;
    transport: number;
  };
}

export interface PriceTrendPoint {
  day: string;
  date: string;
  price: number;
}

export interface BuyerRequirement {
  id: string;
  cropName: string;
  category: string;
  quantityRequired: string;
  priceRange: string;
  status: 'Active' | 'Pending' | 'Completed';
}

export interface MatchingFarmer {
  id: string;
  farmerName: string;
  cropName: string;
  location: string;
  quantityAvailable: string;
  priceExpectation: number;
  quality: string;
  rating: number;
  phone: string;
}

export interface RecommendedBuyer {
  id: string;
  companyName: string;
  businessType: string;
  requiredCrop: string;
  quantity: string;
  location: string;
  offeredPrice: string;
  phone: string;
  whatsapp: string;
  verified: boolean;
  rating: number;
}

export interface FarmerCropItem {
  id: string;
  name: string;
  cropKey: string;
  quantity: string;
  price: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  timeAgo: string;
  type: 'buyer' | 'price' | 'market';
}

export interface UserProfile {
  name: string;
  mobile: string;
  email: string;
  role: Role;
  apmc?: string;
  state?: string;
  isLoggedIn: boolean;
}
