"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ProjectProperty } from "@/lib/mapProject";

interface DetailPanelProps {
  property: ProjectProperty | null;
  onClose: () => void;
  onDirections: () => void;
  onGeographic?: () => void;
  on3DView: () => void;
  onImmersiveView: () => void;
}

export default function DetailPanel({
  property,
  onClose,
  onDirections,
  onGeographic,
  on3DView,
  onImmersiveView,
}: DetailPanelProps) {
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-scroll carousel
  useEffect(() => {
    if (!property) { setActiveSlide(0); return; }
    const allImages = [property.image, ...(property.galleryImages || [])].filter(Boolean);
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % allImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [property]);

  const getPriceBreakdown = () => {
    if (!property?.startingPrice) return null;
    const base = property.startingPrice;
    const isUC = property.projectStatus !== "ready-to-move";

    // Use backend data if available, otherwise calculate estimates
    const bd = property.priceBreakdown;
    if (bd && bd.totalPrice) {
      const fmt = (n: number | undefined) => {
        if (!n) return null;
        return n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : `₹${(n / 100000).toFixed(1)} L`;
      };
      return {
        base: fmt(bd.basePrice || base) || fmt(base)!,
        gst: fmt(bd.gst),
        gstRate: `${bd.gstPercentage || 5}%`,
        stamp: fmt(bd.stampDuty),
        stampRate: `${bd.stampDutyPercentage || 5.5}%`,
        reg: fmt(bd.registration),
        regRate: `${bd.registrationPercentage || 1}%`,
        legalCharges: fmt(bd.legalCharges),
        maintenanceDeposit: fmt(bd.maintenanceDeposit),
        otherCharges: fmt(bd.otherCharges),
        total: fmt(bd.totalPrice)!,
        isUC,
        isFromBackend: true,
      };
    }

    // Fallback: Calculate estimates
    const gst = isUC ? Math.round(base * 0.05) : 0;
    const stamp = Math.round(base * 0.055);
    const reg = Math.round(base * 0.01);
    const total = base + gst + stamp + reg;
    const fmt = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : `₹${(n / 100000).toFixed(1)} L`;
    return {
      base: fmt(base),
      gst: gst > 0 ? fmt(gst) : null,
      gstRate: isUC ? "5%" : "0%",
      stamp: fmt(stamp),
      stampRate: "~5.5%",
      reg: fmt(reg),
      regRate: "~1%",
      legalCharges: null as string | null,
      maintenanceDeposit: null as string | null,
      otherCharges: null as string | null,
      total: fmt(total),
      isUC,
      isFromBackend: false,
    };
  };

  const breakdown = getPriceBreakdown();

  return (
    <div
      className={`fixed z-50 transition-transform duration-400 ease-out
        md:top-0 md:left-0 md:h-full md:w-[420px]
        top-auto left-0 right-0 bottom-0 w-full h-[85vh] rounded-t-3xl md:rounded-none
        ${property ? "translate-y-0 md:translate-x-0" : "translate-y-full md:-translate-x-full md:translate-y-0"}
      `}
    >
      {property && (
        <div className="bg-white h-full overflow-y-auto shadow-2xl md:rounded-none rounded-t-3xl">
          {/* Handle bar (mobile) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* ─── Header ─── */}
          <div className="px-5 pt-4 pb-1 flex items-start justify-between">
            {/* Status Badge (only when not RERA verified) */}
            <div className="flex-1 min-w-0">
              {!property.reraApproved && (
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-1 ${
                  property.projectStatus === "ready-to-move" ? "bg-green-100 text-green-700" :
                  property.projectStatus === "pre-launch" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {property.projectStatus === "ready-to-move" ? "✅ READY TO MOVE" :
                   property.projectStatus === "pre-launch" ? "🔔 PRE-LAUNCH" :
                   "🏗️ UNDER CONSTRUCTION"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              </button>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg" aria-label="Close">
                ✕
              </button>
            </div>
          </div>

          {/* ─── Name ─── */}
          <div className="px-5 pb-1">
            <h2 className="text-2xl font-black text-gray-900 leading-tight uppercase">
              {property.property_name}
            </h2>
          </div>

          {/* ─── Address ─── */}
          <div className="px-5 pb-2">
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <span className="text-red-500 mt-0.5">📍</span>
              <span className="uppercase">{property.location}, {property.city}</span>
            </p>
          </div>

          {/* ─── BHK Options (dot separated) ─── */}
          {property.bhkOptions && property.bhkOptions.length > 0 && (
            <div className="px-5 pb-3">
              <p className="text-sm font-semibold text-gray-800">
                {property.bhkOptions.join(" · ")}
              </p>
            </div>
          )}

          {/* ─── Price + Area Row ─── */}
          <div className="px-5 pb-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Price starting from</p>
              <p className="text-3xl font-black text-gray-900">
                ₹{property.startingPrice
                  ? (property.startingPrice >= 10000000
                    ? `${(property.startingPrice / 10000000).toFixed(1)} Cr`
                    : `${(property.startingPrice / 100000).toFixed(0)} L`)
                  : "N/A"}
                <span className="text-sm font-normal text-gray-500 ml-1">onwards</span>
              </p>
              {property.pricePerSqFt !== undefined && property.pricePerSqFt > 0 && (
                <p className="text-[11px] text-gray-500">₹{property.pricePerSqFt.toLocaleString("en-IN")}/sq.ft</p>
              )}
            </div>
            {property.carpetAreaRange && (
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{property.carpetAreaRange.split("-").pop()?.trim() || property.carpetAreaRange}</p>
                <p className="text-[10px] text-gray-400 uppercase">sqft carpet</p>
              </div>
            )}
          </div>

          {/* ─── See Price Details ─── */}
          <div className="px-5 pb-3">
            <p className="text-xs text-blue-600 cursor-pointer hover:underline select-none" onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}>
              {showPriceBreakdown ? "▲" : "▼"} See price details
            </p>
            {showPriceBreakdown && breakdown && (
              <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Base Price</span><span className="font-semibold">{breakdown.base}</span></div>
                {breakdown.gst ? <div className="flex justify-between text-xs"><span className="text-gray-500">GST ({breakdown.gstRate})</span><span className="font-semibold">{breakdown.gst}</span></div> : <div className="flex justify-between text-xs"><span className="text-gray-500">GST</span><span className="font-semibold text-green-600">Exempt ✓</span></div>}
                <div className="flex justify-between text-xs"><span className="text-gray-500">Stamp Duty ({breakdown.stampRate})</span><span className="font-semibold">{breakdown.stamp}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Registration ({breakdown.regRate})</span><span className="font-semibold">{breakdown.reg}</span></div>
                {breakdown.legalCharges && <div className="flex justify-between text-xs"><span className="text-gray-500">Legal Charges</span><span className="font-semibold">{breakdown.legalCharges}</span></div>}
                {breakdown.maintenanceDeposit && <div className="flex justify-between text-xs"><span className="text-gray-500">Maintenance Deposit</span><span className="font-semibold">{breakdown.maintenanceDeposit}</span></div>}
                {breakdown.otherCharges && <div className="flex justify-between text-xs"><span className="text-gray-500">Other Charges</span><span className="font-semibold">{breakdown.otherCharges}</span></div>}
                <div className="flex justify-between text-xs pt-1.5 border-t border-gray-200"><span className="font-bold">Total (approx)</span><span className="font-bold text-green-700">{breakdown.total}</span></div>
                <p className="text-[9px] text-gray-400 mt-1">{breakdown.isFromBackend ? "* As provided by builder." : "* Approximate charges. Consult builder for exact costs."}</p>
              </div>
            )}
          </div>

          {/* ─── RERA Number Badge ─── */}
          {property.reraApproved && property.reraNumber && (
            <div className="px-5 pb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-800 font-mono">
                ✅ RERA: P{property.reraNumber}
              </span>
            </div>
          )}

          {/* ─── Action Buttons ─── */}
          <div className="px-5 pb-3 flex gap-2 overflow-x-auto">
            <button onClick={onDirections} className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap">Directions</button>
            <button onClick={() => { if (onGeographic) onGeographic(); }} className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap">Geographic</button>
            <button onClick={on3DView} className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap">Satellite</button>
            <button onClick={on3DView} className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap">3D View</button>
            <button onClick={onImmersiveView} className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap">Virtual View</button>
          </div>

          {/* ─── Auto-scrolling Image Carousel ─── */}
          {(() => {
            const allImages = [property.image, ...(property.galleryImages || [])].filter(Boolean);
            return (
              <div className="relative h-[220px] w-full overflow-hidden">
                {/* Slides */}
                <div
                  className="flex h-full transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {allImages.map((img, i) => (
                    <div key={`slide-${i}`} className="relative min-w-full h-full">
                      <Image src={img} alt={`${property.property_name} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
                {/* Badge */}
                <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wide">
                  Actual Site Photo
                </span>
                {/* Image counter */}
                <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                  {activeSlide + 1}/{allImages.length}
                </span>
                {/* Dots */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    {allImages.map((_, i) => (
                      <button
                        key={`dot-${i}`}
                        onClick={() => setActiveSlide(i)}
                        className={`w-1.5 h-1.5 rounded-full transition ${i === activeSlide ? "bg-white" : "bg-white/40"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── Call / WhatsApp / Book Visit ─── */}
          <div className="px-5 py-4 flex gap-2">
            {property.cta?.callNumber && (
              <a href={`tel:${property.cta.callNumber}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                📞 Call
              </a>
            )}
            {property.cta?.whatsappNumber && (
              <a href={`https://wa.me/91${property.cta.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition">
                💬 WhatsApp
              </a>
            )}
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 text-white rounded-full text-xs font-medium hover:bg-red-600 transition">
              {property.cta?.buttonText || "Book Visit"}
            </button>
          </div>

          {/* ─── Top Facilities ─── */}
          {property.amenities.length > 0 && (
            <div className="px-5 pb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Top Facilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((a, i) => (
                  <div key={`amenity-${i}`} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-blue-500">🏢</span>{a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Other Details ─── */}
          <div className="px-5 pb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Other Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.carpetAreaRange && <div><p className="text-[10px] text-gray-400">Carpet Area</p><p className="text-xs font-medium">{property.carpetAreaRange}</p></div>}
              {property.floorRange && <div><p className="text-[10px] text-gray-400">Floors</p><p className="text-xs font-medium">{property.floorRange}</p></div>}
              {property.bankLoanAvailable && <div><p className="text-[10px] text-gray-400">Bank Loan</p><p className="text-xs font-medium text-green-600">Available ✓</p></div>}
              {property.gatedCommunity && <div><p className="text-[10px] text-gray-400">Gated Community</p><p className="text-xs font-medium text-green-600">Yes ✓</p></div>}
              {property.facingOptions && property.facingOptions.length > 0 && <div><p className="text-[10px] text-gray-400">Facing</p><p className="text-xs font-medium">{property.facingOptions.join(", ")}</p></div>}
              <div><p className="text-[10px] text-gray-400">Type</p><p className="text-xs font-medium capitalize">{property.type}</p></div>
            </div>
          </div>

          {/* ─── Builder ─── */}
          {property.builder && (
            <div className="px-5 pb-4 border-t border-gray-100 pt-3">
              <p className="text-[10px] text-gray-400">Builder / Developer</p>
              <p className="text-sm font-medium text-gray-800">{property.builder}</p>
            </div>
          )}

          {/* ─── Brochure ─── */}
          {property.brochurePdf && (
            <div className="px-5 pb-6">
              <a href={property.brochurePdf} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition">
                📄 Download Brochure
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
