"use client";

import { MdMyLocation } from "react-icons/md";

interface MapButtonsProps {
  incompleteCount: number;
  onIncompleteClick: () => void;
  onDirectionsClick: () => void;
  onLocationClick: () => void;
}

export default function MapButtons({
  incompleteCount,
  onIncompleteClick,
  onDirectionsClick,
  onLocationClick,
}: MapButtonsProps) {
  return (
    <div className="absolute bottom-14 right-4 z-10 flex flex-col gap-2 items-center">
      {incompleteCount > 0 && (
        <button
          onClick={onIncompleteClick}
          className="w-11 h-11 bg-amber-500 hover:bg-amber-600 rounded-full shadow-lg flex items-center justify-center transition relative"
          title={`${incompleteCount} properties missing coordinates`}
          aria-label="Show incomplete properties"
        >
          <span className="text-white text-sm font-bold">⚠️</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {incompleteCount}
          </span>
        </button>
      )}
      <button
        onClick={onDirectionsClick}
        className="w-11 h-11 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition"
        title="Get Directions"
        aria-label="Get Directions"
      >
        <span className="text-white text-lg">▶</span>
      </button>
      <button
        onClick={onLocationClick}
        className="w-11 h-11 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center transition"
        title="My Location"
        aria-label="Get current location"
      >
        <MdMyLocation size={20} className="text-white" />
      </button>
    </div>
  );
}
