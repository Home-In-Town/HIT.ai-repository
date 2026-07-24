"use client";

interface StreetViewOverlayProps {
  coords: { lat: number; lng: number } | null;
  onClose: () => void;
}

export default function StreetViewOverlay({
  coords,
  onClose,
}: StreetViewOverlayProps) {
  if (!coords) return null;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black">
        <h3 className="text-white font-medium text-sm">
          Street View / Immersive
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-sm"
        >
          ✕
        </button>
      </div>
      <div className="flex-1">
        <iframe
          src={`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${coords.lat},${coords.lng}&heading=210&pitch=10&fov=90`}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
