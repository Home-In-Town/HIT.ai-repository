/**
 * Utility functions for transforming backend project data into frontend format.
 */

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
  cta?: { whatsappNumber?: string; callNumber?: string; buttonText?: string };
  bhkOptions?: string[];
  // Extended details
  projectStatus?: string;
  carpetAreaRange?: string;
  floorRange?: string;
  plotSizeRange?: string;
  pricePerSqFt?: number;
  startingPrice?: number;
  bankLoanAvailable?: boolean;
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

export interface IncompleteProperty {
  name: string;
  reason: string;
  data: Record<string, unknown>;
}

/**
 * Extract lat/lng from Google Maps URL when direct coordinates are missing.
 */
export function extractCoordsFromMapLink(
  link: string
): { lat: number; lng: number } | null {
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

  // DMS URL-encoded pattern
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
 * Convert a raw backend project object into our frontend ProjectProperty format.
 * Returns null if the project cannot be placed on the map.
 */
export function mapProject(
  p: Record<string, unknown>
): ProjectProperty | null {
  let lat = Number(p.latitude) || 0;
  let lng = Number(p.longitude) || 0;

  if ((lat === 0 && lng === 0) || lat > 90 || lng > 180) {
    // Handle DMS entered as number
    // 6-digit: 210609.8 → 21°06'09.8"
    // 8-digit: 21035703 → 21°03'57.03" (last 4 digits = seconds*100)
    const parseDMS = (val: number): number => {
      if (val === 0) return 0;
      const s = val.toString().replace(".", "");
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
        const sec = parseFloat(str.substring(4, 6) + "." + str.substring(6));
        return deg + min / 60 + sec / 3600;
      }
    };

    if (lat > 90) lat = parseDMS(lat);
    if (lng > 180) lng = parseDMS(lng);

    if ((lat === 0 && lng === 0) || lat > 90 || lng > 180) {
      const extracted = extractCoordsFromMapLink(
        (p.googleMapLink as string) || ""
      );
      if (extracted) {
        lat = extracted.lat;
        lng = extracted.lng;
      } else {
        return null;
      }
    }
  }

  const pricing = p.pricing as Record<string, unknown> | undefined;
  const media = p.media as Record<string, unknown> | undefined;
  const config = p.configuration as Record<string, unknown> | undefined;
  const cta = p.cta as Record<string, string> | undefined;
  const coverImage = media?.coverImage as Record<string, string> | undefined;

  const startingPrice = Number(pricing?.startingPrice) || 0;
  const priceShort =
    startingPrice >= 10000000
      ? `₹${(startingPrice / 10000000).toFixed(1)}Cr`
      : startingPrice >= 100000
      ? `₹${Math.round(startingPrice / 100000)}L`
      : `₹${startingPrice}`;

  return {
    id: p.id as string,
    property_name: (p.projectName as string) || "Property",
    description: `${((config?.bhkOptions as string[]) || []).join(", ")} ${(p.projectType as string) || ""}`.trim(),
    property_location: `${p.location || ""}, ${p.city || ""}`.replace(
      /^, |, $/g,
      ""
    ),
    address: `${p.location || ""}, ${p.city || ""}`,
    price: `₹${startingPrice.toLocaleString("en-IN")}`,
    price_short: priceShort,
    type:
      (() => {
        const pt = ((p.projectType as string) || "").toLowerCase();
        const propType = ((p.propertyType as string) || "").toLowerCase();
        const cat = ((p.category as string) || "").toLowerCase();

        // Check propertyType first (more specific)
        if (propType.includes("plot")) return "Plot";
        if (propType.includes("villa")) return "Villa";
        if (propType.includes("apartment") || propType.includes("flat")) return "Flat";
        if (propType.includes("rent")) return "Rent";

        // Fallback to category
        if (cat.includes("commercial") || cat.includes("mixed")) return "Plot";

        // Fallback to projectType
        if (pt === "plot") return "Plot";
        if (pt === "villa") return "Villa";
        if (pt === "rent") return "Rent";

        return "Flat";
      })(),
    builder:
      (p.builderName as string) ||
      (p.owner as Record<string, string>)?.name ||
      "",
    rating: 4.2,
    amenities: (p.amenities as string[]) || [],
    image: coverImage?.url || "/property.jpg",
    status:
      (p.projectStatus as string) === "ready-to-move"
        ? "Ready"
        : "Under Construction",
    lat,
    lng,
    slug: p.slug as string,
    cta: cta
      ? { whatsappNumber: cta.whatsappNumber, callNumber: cta.callNumber, buttonText: cta.buttonText }
      : undefined,
    bhkOptions: (config?.bhkOptions as string[]) || [],
    // Extended details
    projectStatus: (p.projectStatus as string) || "",
    carpetAreaRange: (config?.carpetAreaRange as string) || "",
    floorRange: (config?.floorRange as string) || "",
    plotSizeRange: (config?.plotSizeRange as string) || "",
    pricePerSqFt: Number(pricing?.pricePerSqFt) || 0,
    startingPrice,
    bankLoanAvailable: Boolean(pricing?.bankLoanAvailable),
    reraApproved: Boolean(p.reraApproved),
    reraNumber: (p.reraNumber as string) || "",
    gatedCommunity: Boolean(config?.gatedCommunity),
    facingOptions: (config?.facingOptions as string[]) || [],
    galleryImages: ((media?.galleryImages as Array<Record<string, string>>) || []).map((g) => g.url).filter(Boolean),
    videos: ((media?.videos as Array<Record<string, string>>) || []).map((v) => v.url).filter(Boolean),
    brochurePdf: (media?.brochurePdf as Record<string, string>)?.url || "",
    googleMapLink: (p.googleMapLink as string) || "",
    city: (p.city as string) || "",
    location: (p.location as string) || "",
  };
}

/**
 * Build a partial ProjectProperty from raw data (for incomplete properties).
 */
export function buildPartialProperty(
  p: Record<string, unknown>
): ProjectProperty {
  const pricing = p.pricing as Record<string, unknown> | undefined;
  const media = p.media as Record<string, unknown> | undefined;
  const config = p.configuration as Record<string, unknown> | undefined;
  const cta = p.cta as Record<string, string> | undefined;
  const coverImage = media?.coverImage as Record<string, string> | undefined;
  const startingPrice = Number(pricing?.startingPrice) || 0;
  const priceShort =
    startingPrice >= 10000000
      ? `₹${(startingPrice / 10000000).toFixed(1)}Cr`
      : startingPrice >= 100000
      ? `₹${Math.round(startingPrice / 100000)}L`
      : startingPrice > 0
      ? `₹${startingPrice}`
      : "N/A";

  return {
    id: (p.id as string) || "",
    property_name: (p.projectName as string) || "Unknown",
    description:
      `${((config?.bhkOptions as string[]) || []).join(", ")} ${(p.projectType as string) || ""}`.trim() ||
      "No description",
    property_location:
      `${p.location || ""}, ${p.city || ""}`.replace(/^, |, $/g, "") ||
      "Location not set",
    address:
      `${p.location || ""}, ${p.city || ""}`.replace(/^, |, $/g, "") ||
      "Address not available",
    price:
      startingPrice > 0
        ? `₹${startingPrice.toLocaleString("en-IN")}`
        : "Price not set",
    price_short: priceShort,
    type: (p.projectType as string) === "plot" ? "Plot" : "Flat",
    builder:
      (p.builderName as string) ||
      (p.owner as Record<string, string>)?.name ||
      "N/A",
    rating: 0,
    amenities: (p.amenities as string[]) || [],
    image: coverImage?.url || "/property.jpg",
    status: (p.projectStatus as string) || "Unknown",
    lat: 0,
    lng: 0,
    slug: (p.slug as string) || "",
    cta: cta
      ? { whatsappNumber: cta.whatsappNumber, callNumber: cta.callNumber }
      : undefined,
    bhkOptions: (config?.bhkOptions as string[]) || [],
  };
}

/**
 * Categorize why a project is incomplete (can't be shown on map).
 */
export function getIncompleteReason(p: Record<string, unknown>): string {
  const lat = Number(p.latitude) || 0;
  const lng = Number(p.longitude) || 0;
  const link = (p.googleMapLink as string) || "";

  if (lat === 0 && lng === 0 && !link) {
    return "Missing coordinates & Google Maps link";
  }
  if (lat === 0 && lng === 0 && link.includes("maps.app.goo.gl")) {
    return "Short Google Maps link (use full URL or add lat/lng)";
  }
  if (lat > 90 || lng > 180) {
    return `Invalid coordinates (${lat}, ${lng})`;
  }
  return "Could not extract coordinates";
}
