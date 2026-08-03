"use client";

import Image from "next/image";
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
          {/* Handle bar (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header: Status + Share + Close */}
          <div className="px-5 pt-4 pb-2 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Status Badge */}
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-2 ${
                property.projectStatus === "ready-to-move"
                  ? "bg-green-100 text-green-700"
                  : property.projectStatus === "pre-launch"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {property.projectStatus === "ready-to-move"
                  ? "✅ Ready to Move"
                  : property.projectStatus === "pre-launch"
                  ? "🔔 Pre-Launch"
                  : "🏗️ Under Construction"}
              </span>
              {/* Name */}
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {property.property_name}
              </h2>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="px-5 pb-3">
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <span className="mt-0.5">📍</span>
              <span>{property.location}, {property.city}</span>
            </p>
          </div>

          {/* BHK chips + Area */}
          <div className="px-5 pb-3 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {property.bhkOptions && property.bhkOptions.length > 0
                ? property.bhkOptions.map((bhk: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md border border-gray-200">
                      {bhk}
                    </span>
                  ))
                : null}
            </div>
            {property.carpetAreaRange && (
              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Saleable area</p>
                <p className="text-sm font-bold text-gray-800">{property.carpetAreaRange} <span className="text-xs font-normal text-gray-500">sq ft</span></p>
              </div>
            )}
          </div>

          {/* Price Row */}
          <div className="px-5 pb-4 border-b border-gray-100">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Price starting from</p>
            <div className="flex items-end gap-3 flex-wrap">
              <p className="text-3xl font-black text-gray-900">
                ₹{property.startingPrice
                  ? (property.startingPrice >= 10000000
                    ? `${(property.startingPrice / 10000000).toFixed(1)} Cr`
                    : `${(property.startingPrice / 100000).toFixed(0)} L`)
                  : "N/A"}
                <span className="text-base font-normal text-gray-500 ml-1">onwards</span>
              </p>
              {property.pricePerSqFt && property.pricePerSqFt > 0 && (
                <p className="text-xs text-gray-500 mb-1">
                  ₹{property.pricePerSqFt.toLocaleString("en-IN")}<span className="text-gray-400">/sq.ft</span>
                </p>
              )}
            </div>
            {property.pricePerSqFt && property.pricePerSqFt > 0 && (
              <p className="text-xs text-blue-600 mt-0.5 cursor-pointer hover:underline">See price details &rsaquo;</p>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="px-5 pb-4 flex gap-2 overflow-x-auto">
            <button
              onClick={onDirections}
              className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap"
            >
              Directions
            </button>
            <button
              onClick={() => { if (onGeographic) onGeographic(); }}
              className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap"
            >
              Geographic
            </button>
            <button
              onClick={on3DView}
              className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap"
            >
              Satellite
            </button>
            <button
              onClick={on3DView}
              className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap"
            >
              3D View
            </button>
            <button
              onClick={onImmersiveView}
              className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap"
            >
              Virtual View
            </button>
          </div>

          {/* Cover Image */}
          <div className="relative h-[200px] w-full">
            <Image
              src={property.image}
              alt={property.property_name}
              fill
              className="object-cover"
            />
          </div>

          {/* Gallery Images */}
          {property.galleryImages && property.galleryImages.length > 0 && (
            <div className="flex gap-1 overflow-x-auto px-0 mt-1">
              {property.galleryImages.map((img, i) => (
                <div key={`gallery-${i}`} className="relative w-[120px] h-[80px] shrink-0">
                  <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Call / WhatsApp / Book Site Visit */}
          <div className="px-5 py-4 flex gap-2">
            {property.cta?.callNumber && (
              <a
                href={`tel:${property.cta.callNumber}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                📞 Call
              </a>
            )}
            {property.cta?.whatsappNumber && (
              <a
                href={`https://wa.me/91${property.cta.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                💬 WhatsApp
              </a>
            )}
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 text-white rounded-full text-xs font-medium hover:bg-red-600 transition">
              {property.cta?.buttonText || "Book Site Visit"}
            </button>
          </div>

          {/* Top Facilities */}
          {property.amenities.length > 0 && (
            <div className="px-5 pb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Top Facilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((a, i) => (
                  <div
                    key={`amenity-${i}`}
                    className="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span className="text-blue-500">🏢</span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Details */}
          <div className="px-5 pb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Other Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.carpetAreaRange && (
                <div>
                  <p className="text-[11px] text-gray-400">Carpet Area</p>
                  <p className="text-xs font-medium text-gray-700">{property.carpetAreaRange}</p>
                </div>
              )}
              {property.floorRange && (
                <div>
                  <p className="text-[11px] text-gray-400">Floors</p>
                  <p className="text-xs font-medium text-gray-700">{property.floorRange}</p>
                </div>
              )}
              {property.pricePerSqFt && property.pricePerSqFt > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400">Price / sq.ft</p>
                  <p className="text-xs font-medium text-gray-700">₹{property.pricePerSqFt.toLocaleString("en-IN")}</p>
                </div>
              )}
              {property.reraApproved && (
                <div>
                  <p className="text-[11px] text-gray-400">RERA</p>
                  <p className="text-xs font-medium text-gray-700">{property.reraNumber || "Approved"}</p>
                </div>
              )}
              {property.bankLoanAvailable && (
                <div>
                  <p className="text-[11px] text-gray-400">Bank Loan</p>
                  <p className="text-xs font-medium text-green-600">Available ✓</p>
                </div>
              )}
              {property.gatedCommunity && (
                <div>
                  <p className="text-[11px] text-gray-400">Gated Community</p>
                  <p className="text-xs font-medium text-green-600">Yes ✓</p>
                </div>
              )}
              {property.facingOptions && property.facingOptions.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400">Facing</p>
                  <p className="text-xs font-medium text-gray-700">{property.facingOptions.join(", ")}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-gray-400">Type</p>
                <p className="text-xs font-medium text-gray-700 capitalize">{property.type}</p>
              </div>
            </div>
          </div>

          {/* Builder Info */}
          {property.builder && (
            <div className="px-5 pb-4 border-t border-gray-100 pt-4">
              <p className="text-[11px] text-gray-400">Builder / Developer</p>
              <p className="text-sm font-medium text-gray-800">{property.builder}</p>
            </div>
          )}

          {/* Brochure Download */}
          {property.brochurePdf && (
            <div className="px-5 pb-6">
              <a
                href={property.brochurePdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition"
              >
                📄 Download Brochure
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
