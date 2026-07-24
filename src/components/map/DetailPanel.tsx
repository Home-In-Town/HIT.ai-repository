"use client";

import Image from "next/image";
import { ProjectProperty } from "@/lib/mapProject";

interface DetailPanelProps {
  property: ProjectProperty | null;
  onClose: () => void;
  onDirections: () => void;
  on3DView: () => void;
  onImmersiveView: () => void;
}

export default function DetailPanel({
  property,
  onClose,
  onDirections,
  on3DView,
  onImmersiveView,
}: DetailPanelProps) {
  return (
    <div
      className={`fixed z-50 transition-transform duration-400 ease-out
        md:top-0 md:left-0 md:h-full md:w-[420px]
        top-auto left-0 right-0 bottom-0 w-full h-[80vh] rounded-t-3xl md:rounded-none
        ${property ? "translate-y-0 md:translate-x-0" : "translate-y-full md:-translate-x-full md:translate-y-0"}
      `}
    >
      {property && (
        <div className="bg-white h-full overflow-y-auto shadow-2xl md:rounded-none rounded-t-3xl">
          {/* Handle bar (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 text-sm shadow transition"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Property Image */}
          <div className="relative h-[220px] w-full">
            <Image
              src={property.image}
              alt={property.property_name}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="px-5 pt-5 pb-8">
            <p className="text-sm text-gray-500">{property.description}</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">
              {property.property_name}
            </h2>

            <div className="mt-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                {property.address}
              </p>
              <p className="text-xs mt-3">
                <span className="font-bold text-gray-900">RERA</span>{" "}
                <span className="text-gray-500">P52100012345 :</span>
              </p>
            </div>

            {/* Price & Rating */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-700">
                  {property.price_short}
                </span>
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold">
                  i
                </span>
              </div>
              {property.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500 text-sm">★★★★½</span>
                  <span className="text-xs text-gray-500">
                    {property.rating} (0 reviews)
                  </span>
                </div>
              )}
            </div>

            <hr className="my-5 border-gray-200" />

            {/* Apartment Complex */}
            <h3 className="font-semibold text-sm text-gray-500">
              Apartment Complex
            </h3>
            <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
              <div className="min-w-[180px] border border-green-200 rounded-xl p-3 bg-green-50/60">
                <p className="font-bold text-sm text-gray-900">
                  3BHK{" "}
                  <span className="font-normal text-gray-500 text-xs">
                    Apartment (1200)
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-600">
                  <span>🛁 2 Bath</span>
                  <span>🌿 2 Balcony</span>
                </div>
                <p className="font-bold text-sm mt-2">
                  ₹10200000{" "}
                  <span className="text-[10px] font-normal text-green-600">
                    + Charges
                  </span>
                </p>
              </div>
              <div className="min-w-[180px] border border-amber-200 rounded-xl p-3 bg-amber-50/60">
                <p className="font-bold text-sm text-gray-900">
                  2BHK{" "}
                  <span className="font-normal text-gray-500 text-xs">
                    Apartment (900)
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-600">
                  <span>🛁 2 Bath</span>
                  <span>🌿 1 Balcony</span>
                </div>
                <p className="font-bold text-sm mt-2">
                  ₹7650000{" "}
                  <span className="text-[10px] font-normal text-green-600">
                    + Charges
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-5 flex-wrap">
              <button
                onClick={onDirections}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 rounded-full text-xs font-medium text-white hover:bg-green-600 transition"
              >
                <span>📍</span> Directions
              </button>
              <button
                onClick={on3DView}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 rounded-full text-xs font-medium text-white hover:bg-blue-600 transition"
              >
                <span>🏠</span> 3D View
              </button>
              <button
                onClick={onImmersiveView}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-500 rounded-full text-xs font-medium text-white hover:bg-purple-600 transition"
              >
                <span>👁️</span> Immersive View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
