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
