/**
 * Core types matching backend models and frontend interfaces.
 */

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'admin' | 'builder' | 'agent' | 'unassigned' | 'user' | 'employee' | 'captain';
  companyName?: string;
  isVerified: boolean;
  isActive: boolean;
  businessLogoUrl?: string;
}

export interface ProjectProperty {
  id: string;
  property_name: string;
  description: string;
  property_location: string;
  address: string;
  price: string;
  price_short: string;
  type: string;
  builder: string;
  rating: number;
  amenities: string[];
  image: string;
  status: string;
  lat: number;
  lng: number;
  slug?: string;
  cta?: {
    whatsappNumber?: string;
    callNumber?: string;
    buttonText?: string;
  };
  bhkOptions?: string[];
  projectStatus?: string;
  carpetAreaRange?: string;
  floorRange?: string;
  plotSizeRange?: string;
  pricePerSqFt?: number;
  startingPrice?: number;
  bankLoanAvailable?: boolean;
  priceBreakdown?: {
    basePrice?: number;
    gst?: number;
    gstPercentage?: number;
    stampDuty?: number;
    stampDutyPercentage?: number;
    registration?: number;
    registrationPercentage?: number;
    legalCharges?: number;
    maintenanceDeposit?: number;
    otherCharges?: number;
    totalPrice?: number;
  };
  reraApproved?: boolean;
  reraNumber?: string;
  gatedCommunity?: boolean;
  facingOptions?: string[];
  galleryImages?: string[];
  videos?: string[];
  brochurePdf?: string;
  googleMapLink?: string;
  city?: string;
  location?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSkipped: boolean;
}

// Navigation param types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PropertyDetail: { property: ProjectProperty };
};

export type AuthStackParamList = {
  Login: undefined;
  OTP: { phone: string; isRegister?: boolean };
};
