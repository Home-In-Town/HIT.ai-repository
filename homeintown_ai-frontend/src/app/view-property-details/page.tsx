"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { apiRequest } from "@/lib/api";

interface ProjectData {
  id: string;
  projectName: string;
  projectType: string;
  category?: string;
  propertyType?: string;
  builderName: string;
  owner?: { name: string; phone: string };
  city: string;
  location: string;
  latitude: number;
  longitude: number;
  googleMapLink: string;
  reraApproved: boolean;
  reraNumber: string;
  projectStatus: string;
  pricing: {
    startingPrice: number;
    pricePerSqFt: number;
    totalPriceRange: string;
    paymentPlan: string;
    bankLoanAvailable: boolean;
  };
  configuration: {
    bhkOptions: string[];
    carpetAreaRange: string;
    floorRange: string;
    plotSizeRange: string;
    facingOptions: string[];
    gatedCommunity: boolean;
  };
  amenities: string[];
  media: {
    coverImage?: { url: string };
    galleryImages?: { url: string }[];
    videos?: { url: string }[];
    brochurePdf?: { url: string };
    layoutImage?: { url: string };
  };
  cta: {
    buttonText: string;
    whatsappNumber: string;
    callNumber: string;
  };
  slug: string;
}

function formatPrice(value: number): string {
  if (!value) return "";
  if (value >= 10000000) return `${(value / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(0)} Lac`;
  return value.toLocaleString("en-IN");
}

function formatStatus(status: string): string {
  return status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function PropertyContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [mapView, setMapView] = useState<"roadmap" | "satellite" | "3d" | "streetview">("roadmap");

  useEffect(() => {
    if (!slug) return;
    const fetchProject = async () => {
      try {
        const data = await apiRequest<ProjectData>(`public/projects/${slug}`);
        setProject(data);
      } catch (err) {
        console.error(err);
        setError("Property not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4">🏠</p>
          <h1 className="text-xl font-bold text-gray-800">Property Not Found</h1>
          <p className="text-sm text-gray-500 mt-2">The property you&apos;re looking for doesn&apos;t exist.</p>
          <a href="/" className="inline-block mt-4 px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">
            Go to Map
          </a>
        </div>
      </div>
    );
  }

  // Build all images array
  const allImages: string[] = [];
  if (project.media?.coverImage?.url) allImages.push(project.media.coverImage.url);
  if (project.media?.galleryImages) {
    project.media.galleryImages.forEach((img) => { if (img.url) allImages.push(img.url); });
  }
  if (allImages.length === 0) allImages.push("/property.jpg");

  const isPlot = project.projectType === "plot" || project.propertyType?.toLowerCase().includes("plot");

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Top CTA Bar ─── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => window.history.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </button>
          <a href="/" className="flex-shrink-0">
            <Image src="/new_logo.png" alt="HomeInTown" width={80} height={32} className="h-[24px] md:h-[28px] w-auto" />
          </a>
        </div>
        <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
          {project.cta?.callNumber && (
            <a href={`tel:${project.cta.callNumber}`} className="px-3 md:px-4 py-1.5 md:py-2 bg-green-700 text-white text-[11px] md:text-xs font-medium rounded-full hover:bg-green-800 transition">
              📞 Call
            </a>
          )}
          {project.cta?.whatsappNumber && (
            <a href={`https://wa.me/91${project.cta.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="px-3 md:px-4 py-1.5 md:py-2 border border-green-700 text-green-700 text-[11px] md:text-xs font-medium rounded-full hover:bg-green-50 transition">
              WhatsApp
            </a>
          )}
          <button onClick={() => setShowEnquiry(true)} className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 text-[11px] md:text-xs font-medium rounded-full hover:bg-gray-50 transition">
            ✏️ Enquire
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* ─── TOP: Info (left) + Map (right) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left: Property Info */}
          <div>
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {project.projectStatus && (
                <span className="px-3 py-1 text-[11px] font-medium bg-green-700 text-white rounded-full">
                  {formatStatus(project.projectStatus)}
                </span>
              )}
              {project.category && (
                <span className="px-3 py-1 text-[11px] font-medium bg-amber-700 text-white rounded-full">
                  {project.category}
                </span>
              )}
              {project.propertyType && (
                <span className="px-3 py-1 text-[11px] font-medium bg-gray-600 text-white rounded-full">
                  {project.propertyType}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-semibold text-gray-800">{project.projectName}</h1>
            
            {/* Builder */}
            {(project.builderName || project.owner?.name) && (
              <p className="text-sm text-gray-600 mt-1">
                By <span className="font-medium">{project.builderName || project.owner?.name}</span>
              </p>
            )}

            {/* Location */}
            <p className="flex items-center gap-1 text-gray-500 text-sm mt-2">
              📍 {project.location}{project.city ? `, ${project.city}` : ""}
            </p>

            {/* Price */}
            {(project.pricing?.startingPrice || project.pricing?.pricePerSqFt) && (
              <div className="mt-4">
                <p className="text-xs text-green-700">Starting at</p>
                <p className="text-3xl font-semibold text-gray-900">
                  ₹{formatPrice(project.pricing.startingPrice)}
                  {project.pricing.pricePerSqFt > 0 && (
                    <span className="ml-2 text-base font-normal text-gray-500">
                      @ ₹{project.pricing.pricePerSqFt.toLocaleString("en-IN")} / sq.ft.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Right: Map Section */}
          <div>
            {/* Map Action Buttons */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {project.googleMapLink && (
                <a href={`https://homeintown.ai/?lat=${project.latitude}&lng=${project.longitude}&directions=true`} className="px-3 py-1.5 bg-green-700 text-white text-xs rounded-full">
                  📍 Directions
                </a>
              )}
              <a href={`https://homeintown.ai/?lat=${project.latitude}&lng=${project.longitude}&only=true`} className={`px-3 py-1.5 text-xs rounded-full ${mapView === "roadmap" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}>
                🗺️ Map
              </a>
              <button onClick={() => setMapView("satellite")} className={`px-3 py-1.5 text-xs rounded-full ${mapView === "satellite" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}>
                🛰️ Satellite
              </button>
              <button onClick={() => setMapView("3d")} className={`px-3 py-1.5 text-xs rounded-full ${mapView === "3d" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}>
                🏠 3D View
              </button>
              <button onClick={() => setMapView("streetview")} className={`px-3 py-1.5 text-xs rounded-full ${mapView === "streetview" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}>
                👁️ Virtual View
              </button>
            </div>

            {/* Embedded Map */}
            {project.latitude !== 0 && project.longitude !== 0 ? (
              <div className="rounded-xl overflow-hidden h-[300px] border border-gray-200">
                {mapView === "streetview" ? (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${project.latitude},${project.longitude}&heading=210&pitch=10&fov=90`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${project.latitude},${project.longitude}&zoom=${mapView === "3d" ? "18" : "15"}&maptype=${mapView === "satellite" || mapView === "3d" ? "satellite" : "roadmap"}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                )}
              </div>
            ) : (
              <div className="rounded-xl h-[300px] border border-gray-200 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Map not available (coordinates missing)</p>
              </div>
            )}

            {/* CTA below map */}
            <div className="flex gap-2 mt-4">
              {project.cta?.callNumber && (
                <a href={`tel:${project.cta.callNumber}`} className="flex-1 text-center py-3 bg-green-700 text-white text-sm font-medium rounded-full hover:bg-green-800">
                  📞 Call
                </a>
              )}
              {project.cta?.whatsappNumber && (
                <a href={`https://wa.me/91${project.cta.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-3 border border-green-700 text-green-700 text-sm font-medium rounded-full hover:bg-green-50">
                  💬 WhatsApp
                </a>
              )}
              <button onClick={() => setShowEnquiry(true)} className="flex-1 text-center py-3 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600">
                {project.cta?.buttonText || "Book Site Visit"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── BELOW: Full-width content ─── */}
        <div>
          {/* Image Carousel */}
          <div className="relative rounded-xl overflow-hidden mb-4">
            <div className="relative h-[280px] md:h-[350px]">
              <Image
                src={allImages[activeImage]}
                alt={project.projectName}
                fill
                className="object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  ‹
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-2 h-2 rounded-full transition ${i === activeImage ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Flat / Plot Details */}
          <div className="bg-gray-50 rounded-xl p-5 mb-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              {isPlot ? "Plot Details" : "Flat Details"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {!isPlot && project.configuration?.bhkOptions?.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400">BHK Options</p>
                  <p className="text-sm font-medium">{project.configuration.bhkOptions.join(", ")}</p>
                </div>
              )}
              {!isPlot && project.configuration?.carpetAreaRange && (
                <div>
                  <p className="text-[11px] text-gray-400">Carpet Area</p>
                  <p className="text-sm font-medium">{project.configuration.carpetAreaRange}</p>
                </div>
              )}
              {!isPlot && project.configuration?.floorRange && (
                <div>
                  <p className="text-[11px] text-gray-400">Floors</p>
                  <p className="text-sm font-medium">{project.configuration.floorRange}</p>
                </div>
              )}
              {isPlot && project.configuration?.plotSizeRange && (
                <div>
                  <p className="text-[11px] text-gray-400">Plot Size</p>
                  <p className="text-sm font-medium">{project.configuration.plotSizeRange}</p>
                </div>
              )}
              {project.configuration?.facingOptions?.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400">Facing</p>
                  <p className="text-sm font-medium">{project.configuration.facingOptions.join(", ")}</p>
                </div>
              )}
              {project.configuration?.gatedCommunity && (
                <div>
                  <p className="text-[11px] text-gray-400">Gated Community</p>
                  <p className="text-sm font-medium text-green-600">Yes ✓</p>
                </div>
              )}
              {project.pricing?.bankLoanAvailable && (
                <div>
                  <p className="text-[11px] text-gray-400">Bank Loan</p>
                  <p className="text-sm font-medium text-green-600">Available ✓</p>
                </div>
              )}
              {project.reraApproved && (
                <div>
                  <p className="text-[11px] text-gray-400">RERA</p>
                  <p className="text-sm font-medium">{project.reraNumber || "Approved"}</p>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {project.amenities?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {project.amenities.map((a, i) => (
                  <div key={`am-${i}`} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                    <span className="w-6 h-6 bg-green-50 rounded flex items-center justify-center text-green-600 text-xs">✓</span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brochure */}
          {project.media?.brochurePdf?.url && (
            <a
              href={project.media.brochurePdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 border border-green-200 text-green-700 rounded-xl text-sm font-medium hover:bg-green-50 transition mb-4"
            >
              📄 Download Brochure
            </a>
          )}

          {/* Video */}
          {project.media?.videos && project.media.videos.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-3">Video Tour</h3>
              <video controls className="w-full rounded-xl" poster={allImages[0]}>
                <source src={project.media.videos[0].url} type="video/mp4" />
              </video>
            </div>
          )}
        </div>
      </div>

      {/* ─── Enquiry Modal ─── */}
      {showEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Enquire Now</h3>
              <button onClick={() => setShowEnquiry(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Enquiry submitted! We will contact you soon."); setShowEnquiry(false); }}>
              <input type="text" placeholder="Your Name" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
              <input type="tel" placeholder="Phone Number" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
              <input type="email" placeholder="Email (optional)" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
              <textarea placeholder="Message (optional)" rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
              <button type="submit" className="w-full py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition">
                Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewPropertyDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    }>
      <PropertyContent />
    </Suspense>
  );
}
