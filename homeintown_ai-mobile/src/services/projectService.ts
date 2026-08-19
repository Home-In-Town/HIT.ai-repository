/**
 * Project Service — public endpoints for property listings.
 */

import { apiRequest } from './api';
import { ProjectProperty } from '../types';

// Raw project from backend
interface RawProject {
  _id: string;
  id?: string;
  projectName: string;
  projectType?: string;
  category?: string;
  propertyType?: string;
  owner?: { name: string; phone: string };
  city?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  googleMapLink?: string;
  reraApproved?: boolean;
  reraNumber?: string;
  projectStatus?: string;
  pricing?: {
    startingPrice?: number;
    pricePerSqFt?: number;
    totalPriceRange?: string;
    paymentPlan?: string;
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
  };
  configuration?: {
    bhkOptions?: string[];
    carpetAreaRange?: string;
    floorRange?: string;
    plotSizeRange?: string;
    facingOptions?: string[];
    gatedCommunity?: boolean;
  };
  amenities?: string[];
  media?: {
    coverImage?: { url: string };
    galleryImages?: { url: string }[];
    videos?: { url: string }[];
    brochurePdf?: { url: string };
    layoutImage?: { url: string };
  };
  cta?: {
    buttonText?: string;
    whatsappNumber?: string;
    callNumber?: string;
  };
  slug?: string;
  status?: string;
}

/**
 * Format price for display (₹ in Cr/L).
 */
function formatPrice(value?: number): string {
  if (!value) return 'Price on Request';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Parse DMS-style numbers (e.g. 210609.8 → 21.1027°, 21035703 → 21.0592°).
 * Backend sometimes stores coordinates in this format.
 */
function parseDMS(val: number): number {
  if (val === 0) return 0;
  const s = val.toString().replace('.', '');
  if (s.length <= 6) {
    // e.g. 210609 → 21°06'09"
    const orig = val.toString();
    const deg = parseInt(orig.substring(0, 2));
    const min = parseInt(orig.substring(2, 4));
    const sec = parseFloat(orig.substring(4));
    return deg + min / 60 + sec / 3600;
  } else {
    // e.g. 21035703 → degrees=21, minutes=03, seconds=57.03
    const str = val.toString();
    const deg = parseInt(str.substring(0, 2));
    const min = parseInt(str.substring(2, 4));
    const sec = parseFloat(str.substring(4, 6) + '.' + str.substring(6));
    return deg + min / 60 + sec / 3600;
  }
}

/**
 * Extract lat/lng from Google Maps URL when direct coordinates are missing or invalid.
 * Same logic as frontend's extractCoordsFromMapLink.
 */
function extractCoordsFromMapLink(link: string): { lat: number; lng: number } | null {
  if (!link) return null;

  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    /!8m2!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /destination=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  ];

  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }

  // DMS URL-encoded pattern (degree/minute/second in URL)
  const dmsPattern =
    /(\d+)%C2%B0(\d+).*?(\d+\.?\d*).*?(\d+)%C2%B0(\d+).*?(\d+\.?\d*)/;
  const dmsMatch = link.match(dmsPattern);
  if (dmsMatch) {
    const lat =
      parseInt(dmsMatch[1]) +
      parseInt(dmsMatch[2]) / 60 +
      parseFloat(dmsMatch[3]) / 3600;
    const lng =
      parseInt(dmsMatch[4]) +
      parseInt(dmsMatch[5]) / 60 +
      parseFloat(dmsMatch[6]) / 3600;
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Transform raw backend project into frontend ProjectProperty.
 */
function mapProject(raw: RawProject): ProjectProperty | null {
  let lat = raw.latitude || 0;
  let lng = raw.longitude || 0;

  // If coordinates are invalid or missing, try DMS parsing then map link extraction
  const coordsInvalid = Math.abs(lat) > 90 || Math.abs(lng) > 180 || (!lat && !lng);
  if (coordsInvalid) {
    // Try DMS parsing first (e.g. 21138041 → 21.xxx)
    if (lat > 90) lat = parseDMS(raw.latitude || 0);
    if (lng > 180) lng = parseDMS(raw.longitude || 0);

    // If still invalid, try Google Maps link
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || (!lat && !lng)) {
      if (raw.googleMapLink) {
        const extracted = extractCoordsFromMapLink(raw.googleMapLink);
        if (extracted) {
          lat = extracted.lat;
          lng = extracted.lng;
        } else {
          return null; // Can't determine location
        }
      } else {
        return null; // No coords and no map link
      }
    }
  }

  const coverImage = raw.media?.coverImage?.url || '';
  const galleryImages = raw.media?.galleryImages?.map((img) => img.url) || [];
  const videos = raw.media?.videos?.map((v) => v.url) || [];

  // Builder name: use builderName field, fallback to owner.name
  const builderName = (raw as any).builderName || raw.owner?.name || '';

  return {
    id: raw._id || (raw as any).id,
    property_name: raw.projectName,
    description: '',
    property_location: `${raw.location || ''}${raw.city ? ', ' + raw.city : ''}`,
    address: `${raw.location || ''}, ${raw.city || ''}`,
    price: formatPrice(raw.pricing?.startingPrice),
    price_short: formatPrice(raw.pricing?.startingPrice),
    type: raw.projectType || raw.propertyType || 'flat',
    builder: builderName,
    rating: 0,
    amenities: raw.amenities || [],
    image: coverImage,
    status: raw.status || 'published',
    lat,
    lng,
    slug: raw.slug,
    cta: raw.cta,
    bhkOptions: raw.configuration?.bhkOptions,
    projectStatus: raw.projectStatus,
    carpetAreaRange: raw.configuration?.carpetAreaRange,
    floorRange: raw.configuration?.floorRange,
    plotSizeRange: raw.configuration?.plotSizeRange,
    pricePerSqFt: raw.pricing?.pricePerSqFt,
    startingPrice: raw.pricing?.startingPrice,
    bankLoanAvailable: raw.pricing?.bankLoanAvailable,
    priceBreakdown: raw.pricing?.priceBreakdown,
    reraApproved: raw.reraApproved,
    reraNumber: raw.reraNumber,
    gatedCommunity: raw.configuration?.gatedCommunity,
    facingOptions: raw.configuration?.facingOptions,
    galleryImages,
    videos,
    brochurePdf: raw.media?.brochurePdf?.url,
    googleMapLink: raw.googleMapLink,
    city: raw.city,
    location: raw.location,
  };
}

export const projectService = {
  /**
   * Get all published projects (public).
   * Returns { properties, incompleteProperties }.
   */
  getAllProjects: async (): Promise<{
    properties: ProjectProperty[];
    incompleteProperties: { name: string; reason: string }[];
  }> => {
    const raw = await apiRequest<RawProject[]>('public/projects');
    const properties: ProjectProperty[] = [];
    const incompleteProperties: { name: string; reason: string }[] = [];

    for (const item of raw) {
      const mapped = mapProject(item);
      if (mapped) {
        properties.push(mapped);
      } else {
        // Determine reason
        const lat = item.latitude || 0;
        const lng = item.longitude || 0;
        const link = item.googleMapLink || '';
        let reason = 'Could not determine location';
        if (!lat && !lng && !link) {
          reason = 'Missing coordinates & Google Maps link';
        } else if (!lat && !lng && link.includes('maps.app.goo.gl')) {
          reason = 'Short Google Maps link (needs full URL)';
        } else if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          reason = `Invalid coordinates (${lat}, ${lng})`;
        }
        incompleteProperties.push({
          name: item.projectName || 'Unknown',
          reason,
        });
      }
    }

    return { properties, incompleteProperties };
  },

  /**
   * Get a single project by slug (public).
   */
  getProjectBySlug: async (slug: string): Promise<ProjectProperty | null> => {
    const raw = await apiRequest<RawProject>(`public/projects/${slug}`);
    return mapProject(raw);
  },

  /**
   * Get project analytics (public).
   */
  getProjectAnalytics: (projectId: string) =>
    apiRequest<Record<string, unknown>>(`analytics/property/${projectId}`),

  /**
   * Track CTA click.
   */
  trackCta: (data: { projectId: string; ctaType: string; phone?: string }) =>
    apiRequest('track/cta', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),
};
