"use client";

import { useState } from "react";
import { ProjectProperty } from "@/lib/mapProject";

interface DirectionsPanelProps {
  show: boolean;
  properties: ProjectProperty[];
  onClose: () => void;
  onNavigate: (property: ProjectProperty) => void;
}

export default function DirectionsPanel({
  show,
  properties,
  onClose,
  onNavigate,
}: DirectionsPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = properties.filter((p) =>
    search
      ? p.property_name.toLowerCase().includes(search.toLowerCase()) ||
        p.property_location.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <>
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[700px] transition-transform duration-300 ease-out ${
          show ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] max-h-[60vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧭</span>
              <h3 className="font-bold text-white text-sm">Get Directions</h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white text-sm transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-4 py-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((property) => (
              <div
                key={`dir-${property.id}`}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer"
                onClick={() => {
                  if (property.slug) {
                    window.location.href = `/view-property-details?slug=${property.slug}`;
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase">
                    Property
                  </p>
                  <p className="font-bold text-sm text-gray-900 truncate">
                    {property.property_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {property.address}
                  </p>
                  <p className="text-xs font-semibold text-green-600 mt-0.5">
                    Rs. {property.price_short.replace("₹", "")}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate(property); }}
                  className="ml-3 w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 rounded-full transition shrink-0"
                  title={`Get directions to ${property.property_name}`}
                  aria-label="Get directions"
                >
                  <span className="text-blue-600 text-lg">▶</span>
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No properties found
              </div>
            )}
          </div>
        </div>
      </div>

      {show && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
}
