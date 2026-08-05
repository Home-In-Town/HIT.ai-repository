"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  ProjectProperty,
  IncompleteProperty,
  mapProject,
  getIncompleteReason,
} from "@/lib/mapProject";
import SearchBar from "@/components/map/SearchBar";
import MapButtons from "@/components/map/MapButtons";
import DetailPanel from "@/components/map/DetailPanel";
import DirectionsPanel from "@/components/map/DirectionsPanel";
import IncompletePanel from "@/components/map/IncompletePanel";
import StreetViewOverlay from "@/components/map/StreetViewOverlay";

// ─── Constants ───
const CATEGORY_TABS = [
  { name: "All", icon: "🏠" },
  { name: "Flat", icon: "🏢" },
  { name: "Plot", icon: "📐" },
  { name: "Villa", icon: "🏡" },
  { name: "Rent", icon: "💰" },
];

function HomePageContent() {
  // ─── Refs ───
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const locationMarker = useRef<google.maps.Marker | null>(null);
  const locationCircle = useRef<google.maps.Circle | null>(null);
  const overlays = useRef<google.maps.OverlayView[]>([]);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const singleMarker = useRef<google.maps.Marker | null>(null);
  const geoCircle = useRef<google.maps.Circle | null>(null);

  // ─── State ───
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [mapReady, setMapReady] = useState(false);
  const [properties, setProperties] = useState<ProjectProperty[]>([]);
  const [incompleteProperties, setIncompleteProperties] = useState<IncompleteProperty[]>([]);
  const [detailProperty, setDetailProperty] = useState<ProjectProperty | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [streetViewCoords, setStreetViewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [singleViewActive, setSingleViewActive] = useState(false);
  const [geoMode, setGeoMode] = useState(false);
  const [geoCenter, setGeoCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [activePlaceCategory, setActivePlaceCategory] = useState("");
  const [showPlaceFilter, setShowPlaceFilter] = useState(false);
  const placeMarkers = useRef<google.maps.Marker[]>([]);

  // ─── URL Params (for directions from property details page) ───
  const searchParams = useSearchParams();
  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");
  const urlDirections = searchParams.get("directions");
  const urlOnly = searchParams.get("only");
  const urlView = searchParams.get("view");

  // ─── Show only single property marker when "only=true" ───
  useEffect(() => {
    if (!urlLat || !urlLng || urlOnly !== "true" || !mapReady || !mapInstance.current) return;

    const lat = parseFloat(urlLat);
    const lng = parseFloat(urlLng);
    if (isNaN(lat) || isNaN(lng)) return;

    const map = mapInstance.current;

    // Clear all existing overlays
    overlays.current.forEach((o) => (o as unknown as { remove: () => void }).remove());
    overlays.current = [];

    // Remove user location marker/circle
    if (locationMarker.current) { locationMarker.current.setMap(null); locationMarker.current = null; }
    if (locationCircle.current) { locationCircle.current.setMap(null); locationCircle.current = null; }

    // Set map type based on view param
    if (urlView === "satellite" || urlView === "3d") {
      (map as any).setMapTypeId("satellite");
      (map as any).setTilt(urlView === "3d" ? 45 : 0);
      map.setZoom(urlView === "3d" ? 18 : 17);
    } else if (urlView === "streetview") {
      const panorama = (map as any).getStreetView();
      panorama.setPosition({ lat, lng });
      panorama.setPov({ heading: 210, pitch: 10 });
      panorama.setVisible(true);
    } else {
      map.setZoom(16);
    }

    // Pan to property and place a single marker
    map.panTo({ lat, lng });

    if (urlView !== "streetview") {
      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Property Location",
      });
    }
  }, [urlLat, urlLng, urlOnly, urlView, mapReady]);

  // ─── Auto-trigger directions when URL params are present ───
  useEffect(() => {
    if (!urlLat || !urlLng || urlDirections !== "true" || !mapReady || !mapInstance.current) return;

    const destLat = parseFloat(urlLat);
    const destLng = parseFloat(urlLng);
    if (isNaN(destLat) || isNaN(destLng)) return;

    const map = mapInstance.current;

    // Clear all property markers
    overlays.current.forEach((o) => (o as unknown as { remove: () => void }).remove());
    overlays.current = [];

    // Remove user location marker/circle
    if (locationMarker.current) { locationMarker.current.setMap(null); locationMarker.current = null; }
    if (locationCircle.current) { locationCircle.current.setMap(null); locationCircle.current = null; }

    map.panTo({ lat: destLat, lng: destLng });
    map.setZoom(14);

    // Get user location and show directions
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (directionsRenderer.current) directionsRenderer.current.setMap(null);

        const svc = new (window.google.maps as unknown as Record<string, new () => { route: (req: unknown, cb: (r: unknown, s: string) => void) => void }>).DirectionsService();
        const renderer = new (window.google.maps as unknown as Record<string, new (o: Record<string, unknown>) => { setMap: (m: google.maps.Map | null) => void; setDirections: (r: unknown) => void }>).DirectionsRenderer({
          suppressMarkers: false, polylineOptions: { strokeColor: "#4285F4", strokeWeight: 5, strokeOpacity: 0.8 },
        });
        renderer.setMap(map);
        directionsRenderer.current = renderer as unknown as google.maps.DirectionsRenderer;

        svc.route(
          { origin, destination: { lat: destLat, lng: destLng }, travelMode: "DRIVING" },
          (result: unknown, status: string) => {
            if (status === "OK") {
              renderer.setDirections(result);
              setSingleViewActive(true);
            } else {
              console.error("Directions failed:", status);
            }
          }
        );
      },
      (err) => {
        console.error("Geolocation error for directions:", err);
        alert("Location access is needed to show directions. Please allow location access.");
      },
      { enableHighAccuracy: true }
    );
  }, [urlLat, urlLng, urlDirections, mapReady]);

  // ─── Fetch projects from backend ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("only") === "true" || params.get("directions") === "true") return;
    const fetchProjects = async () => {
      try {
        const data = await apiRequest<Record<string, unknown>[]>("public/projects");
        const raw = Array.isArray(data) ? data : [];

        const mapped: ProjectProperty[] = [];
        const incomplete: IncompleteProperty[] = [];

        raw.forEach((p) => {
          const result = mapProject(p);
          if (result) {
            mapped.push(result);
          } else {
            incomplete.push({
              name: (p.projectName as string) || "Unknown Property",
              reason: getIncompleteReason(p),
              data: p,
            });
          }
        });

        // Double check before setting state
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get("only") === "true" || currentParams.get("directions") === "true") return;
        
        setProperties(mapped);
        setIncompleteProperties(incomplete);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // ─── Place markers when map + data ready ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("only") === "true" || params.get("directions") === "true") return;
    if (mapReady && mapInstance.current && properties.length > 0) {
      placePropertyMarkers(mapInstance.current, activeCategory, properties);
      const first = properties[0];
      mapInstance.current.panTo({ lat: first.lat, lng: first.lng });
      mapInstance.current.setZoom(12);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, properties]);

  // ─── Initialize Google Maps ───
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;

    if (window.google?.maps) {
      initMap();
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) return;

    (window as unknown as Record<string, unknown>).initGoogleMap = initMap;
    (window as unknown as Record<string, unknown>).gm_authFailure = () =>
      console.error("Google Maps auth failed");

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false,
      keyboardShortcuts: false,
      styles: [
        // Locality/neighborhood names - more visible
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#111827" }] },
        { featureType: "administrative.locality", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: "3" }] },
        { featureType: "administrative.neighborhood", elementType: "labels.text.fill", stylers: [{ color: "#1a56db" }] },
        { featureType: "administrative.neighborhood", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },

        // Schools - yellow tint + visible labels
        { featureType: "poi.school", elementType: "geometry.fill", stylers: [{ color: "#fef3c7" }] },
        { featureType: "poi.school", elementType: "labels.text.fill", stylers: [{ color: "#92400e" }] },
        { featureType: "poi.school", elementType: "labels.icon", stylers: [{ visibility: "on" }] },

        // Parks - bright green
        { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#bbf7d0" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#166534" }] },
        { featureType: "poi.park", elementType: "labels.icon", stylers: [{ visibility: "on" }] },

        // Hospitals
        { featureType: "poi.medical", elementType: "labels.text.fill", stylers: [{ color: "#b91c1c" }] },
        { featureType: "poi.medical", elementType: "labels.icon", stylers: [{ visibility: "on" }] },

        // Government
        { featureType: "poi.government", elementType: "labels.text.fill", stylers: [{ color: "#1e40af" }] },
        { featureType: "poi.government", elementType: "labels.icon", stylers: [{ visibility: "on" }] },

        // Attractions & Business
        { featureType: "poi.attraction", elementType: "labels", stylers: [{ visibility: "on" }] },
        { featureType: "poi.business", elementType: "labels", stylers: [{ visibility: "on" }] },

        // Water - light blue
        { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#bfdbfe" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#1e40af" }] },

        // Roads - cleaner labels
        { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#374151" }] },
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#1f2937" }] },
      ],
    });
    mapInstance.current = map;
    setMapReady(true);
    // Skip user location when showing single property or directions
    const params = new URLSearchParams(window.location.search);
    if (!params.get("only") && !params.get("directions")) {
      getUserLocation();
    }
  };

  // ─── Price pill overlay factory ───
  const createPriceMarker = (
    map: google.maps.Map,
    property: ProjectProperty,
    onClick: () => void
  ) => {
    const PriceOverlay = class extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;
      private position: google.maps.LatLng;
      private prop: ProjectProperty;

      constructor(pos: google.maps.LatLng, prop: ProjectProperty) {
        super();
        this.position = pos;
        this.prop = prop;
        this.setMap(map);
      }

      onAdd() {
        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.cursor = "pointer";
        this.div.style.transform = "translate(-50%, -50%)";

        const bgColor = this.prop.type === "Rent" ? "#22c55e" : this.prop.type === "Plot" ? "#eab308" : "#ffffff";
        const textColor = this.prop.type === "Rent" || this.prop.type === "Plot" ? "#ffffff" : "#1f2937";
        const borderColor = this.prop.type === "Rent" ? "#16a34a" : this.prop.type === "Plot" ? "#ca8a04" : "#e5e7eb";
        const icon = this.prop.type === "Rent" ? "🔑" : this.prop.type === "Plot" ? "📐" : "🏢";
        const statusBg = this.prop.status === "Ready" ? "#dcfce7" : "#fee2e2";
        const statusColor = this.prop.status === "Ready" ? "#16a34a" : "#dc2626";

        this.div.innerHTML = `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div class="marker-popup" style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%) translateY(-8px) scale(0.95);opacity:0;pointer-events:none;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);z-index:999;width:280px;background:#fff;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.18);overflow:hidden;">
              <div style="position:relative;width:100%;height:140px;overflow:hidden;">
                <img src="${this.prop.image}" alt="${this.prop.property_name}" style="width:100%;height:100%;object-fit:cover;" />
                <span style="position:absolute;top:8px;right:8px;background:${statusBg};color:${statusColor};font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;">${this.prop.status}</span>
              </div>
              <div style="padding:10px 12px;">
                <div style="font-size:13px;font-weight:700;color:#111;">${this.prop.property_name}</div>
                <div style="font-size:11px;color:#666;margin-top:2px;">${this.prop.description}</div>
                <div style="display:flex;align-items:flex-start;gap:4px;margin-top:6px;">
                  <span style="font-size:11px;">📍</span>
                  <span style="font-size:10px;color:#555;line-height:1.4;">${this.prop.address}</span>
                </div>
                <div style="font-size:15px;font-weight:700;color:#dc2626;margin-top:8px;">${this.prop.price}</div>
                <div style="font-size:10px;color:#888;margin-top:2px;">Builder: <strong style="color:#555;">${this.prop.builder}</strong></div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;">
                  ${this.prop.amenities.map((a: string) => `<span style="font-size:10px;background:#fef3c7;border:1px solid #fde68a;padding:2px 6px;border-radius:4px;color:#555;">${a}</span>`).join("")}
                </div>
              </div>
            </div>
            <div class="marker-pill" style="display:flex;flex-direction:column;align-items:flex-start;background:${bgColor};border:1.5px solid ${borderColor};border-radius:10px;padding:3px 7px;box-shadow:0 2px 6px rgba(0,0,0,0.12);font-size:10px;font-weight:600;color:${textColor};white-space:nowrap;transition:transform 0.2s ease;min-width:60px;">
              <div style="display:flex;align-items:center;gap:3px;margin-bottom:1px;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,0.7);animation:blink-dot 1.5s infinite;flex-shrink:0;"></span>
                <span style="font-size:8px;font-weight:700;color:${textColor === '#ffffff' ? 'rgba(255,255,255,0.9)' : '#374151'};overflow:hidden;text-overflow:ellipsis;max-width:80px;">${this.prop.property_name}</span>
              </div>
              <div style="display:flex;align-items:center;gap:3px;">
                <span style="font-size:10px;">${icon}</span>
                <span style="font-size:10px;">${this.prop.price_short}</span>
              </div>
            </div>
          </div>
        `;

        this.div.addEventListener("click", onClick);
        this.div.addEventListener("mouseenter", () => {
          const popup = this.div?.querySelector(".marker-popup") as HTMLElement;
          if (popup) { popup.style.opacity = "1"; popup.style.transform = "translateX(-50%) translateY(-8px) scale(1)"; popup.style.pointerEvents = "auto"; }
          if (this.div) this.div.style.zIndex = "200";
        });
        this.div.addEventListener("mouseleave", () => {
          const popup = this.div?.querySelector(".marker-popup") as HTMLElement;
          if (popup) { popup.style.opacity = "0"; popup.style.transform = "translateX(-50%) translateY(-8px) scale(0.95)"; popup.style.pointerEvents = "none"; }
          if (this.div) this.div.style.zIndex = "1";
        });

        this.getPanes()?.overlayMouseTarget?.appendChild(this.div);
      }

      draw() {
        if (!this.div) return;
        const pos = this.getProjection()?.fromLatLngToDivPixel(this.position);
        if (pos) { this.div.style.left = pos.x + "px"; this.div.style.top = pos.y + "px"; }
      }

      onRemove() { if (this.div?.parentNode) { this.div.parentNode.removeChild(this.div); this.div = null; } }
      remove() { this.setMap(null); }
    };

    return new PriceOverlay(new google.maps.LatLng(property.lat, property.lng), property);
  };

  // ─── Place/filter markers ───
  const placePropertyMarkers = (map: google.maps.Map, category: string, props?: ProjectProperty[]) => {
    const data = props || properties;
    overlays.current.forEach((o) => (o as unknown as { remove: () => void }).remove());
    overlays.current = [];

    const filtered = category === "All" ? data : data.filter((p) => p.type === category);
    filtered.forEach((property) => {
      const overlay = createPriceMarker(map, property, () => setDetailProperty(property));
      overlays.current.push(overlay as unknown as google.maps.OverlayView);
    });
  };

  // ─── User location ───
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const map = mapInstance.current;
        if (!map) return;
        map.panTo(coords);
        map.setZoom(13);

        if (locationMarker.current) locationMarker.current.setMap(null);
        if (locationCircle.current) locationCircle.current.setMap(null);

        locationMarker.current = new window.google.maps.Marker({
          position: coords, map, title: "You are here",
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 } as google.maps.Symbol,
        });
        locationCircle.current = new window.google.maps.Circle({
          map, center: coords, radius: 400, fillColor: "#4285F4", fillOpacity: 0.08, strokeColor: "#4285F4", strokeOpacity: 0.25, strokeWeight: 1,
        });
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // ─── Search handler ───
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    const results = properties.filter(
      (p) => p.property_name.toLowerCase().includes(query) || p.property_location.toLowerCase().includes(query) || p.type.toLowerCase().includes(query)
    );

    if (results.length > 0 && mapInstance.current) {
      mapInstance.current.panTo({ lat: results[0].lat, lng: results[0].lng });
      mapInstance.current.setZoom(14);
      placePropertyMarkers(mapInstance.current, "All", results);
    } else if (window.google?.maps) {
      const geocoder = new (window.google.maps as unknown as Record<string, new () => { geocode: (req: { address: string }, cb: (r: Array<{ geometry: { location: { lat: () => number; lng: () => number } } }>, s: string) => void) => void }>).Geocoder();
      geocoder.geocode({ address: searchQuery }, (res, status) => {
        if (status === "OK" && res.length > 0 && mapInstance.current) {
          mapInstance.current.panTo({ lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() });
          mapInstance.current.setZoom(13);
        }
      });
    }
  };

  // ─── Directions handler ───
  const handleNavigate = (property: ProjectProperty) => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (directionsRenderer.current) directionsRenderer.current.setMap(null);

        const svc = new (window.google.maps as unknown as Record<string, new () => { route: (req: unknown, cb: (r: unknown, s: string) => void) => void }>).DirectionsService();
        const renderer = new (window.google.maps as unknown as Record<string, new (o: Record<string, unknown>) => { setMap: (m: google.maps.Map | null) => void; setDirections: (r: unknown) => void }>).DirectionsRenderer({
          suppressMarkers: false, polylineOptions: { strokeColor: "#4285F4", strokeWeight: 5, strokeOpacity: 0.8 },
        });
        renderer.setMap(map);
        directionsRenderer.current = renderer as unknown as google.maps.DirectionsRenderer;

        svc.route({ origin, destination: { lat: property.lat, lng: property.lng }, travelMode: (window.google.maps as unknown as Record<string, Record<string, string>>).TravelMode.DRIVING },
          (result: unknown, status: string) => {
            if (status === "OK") { renderer.setDirections(result); setShowDirections(false); setSingleViewActive(true); }
            else alert("Could not get directions.");
          }
        );
      },
      () => alert("Please allow location access.")
    );
  };

  // ─── Detail panel actions ───
  const handleDetailDirections = () => {
    if (detailProperty) { handleNavigate(detailProperty); setDetailProperty(null); }
  };
  const handle3DView = () => {
    if (!mapInstance.current || !detailProperty) return;
    const map = mapInstance.current;
    const currentType = (map as unknown as { getMapTypeId: () => string }).getMapTypeId();
    (map as unknown as { setMapTypeId: (t: string) => void }).setMapTypeId(currentType === "hybrid" ? "roadmap" : "hybrid");
    map.panTo({ lat: detailProperty.lat, lng: detailProperty.lng });
    map.setZoom(18);
    setDetailProperty(null);
  };
  const handleImmersiveView = () => {
    if (!detailProperty) return;
    setStreetViewCoords({ lat: detailProperty.lat, lng: detailProperty.lng });
    setDetailProperty(null);
  };

  // ─── Nearby Places Search ───
  const searchNearbyPlaces = (category: string) => {
    if (!mapInstance.current || !geoCenter) return;
    const map = mapInstance.current;

    // Clear previous place markers
    placeMarkers.current.forEach((m) => m.setMap(null));
    placeMarkers.current = [];

    setActivePlaceCategory(category);

    const service = new (window.google.maps as any).places.PlacesService(map);
    const request = {
      location: new window.google.maps.LatLng(geoCenter.lat, geoCenter.lng),
      radius: 2500,
      type: category,
    };

    service.nearbySearch(request, (results: any[], status: string) => {
      if (status === "OK" && results) {
        results.forEach((place: any) => {
          if (!place.geometry?.location) return;
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
          });

          const infoWindow = new (window.google.maps as any).InfoWindow({
            content: `<div style="padding:4px;max-width:200px;"><strong style="font-size:12px;">${place.name}</strong><p style="font-size:11px;color:#666;margin:2px 0 0;">${place.vicinity || ""}</p></div>`,
          });
          marker.addListener("click", () => infoWindow.open(map, marker));

          placeMarkers.current.push(marker);
        });
      }
    });
  };

  // ─── Clear Geo Mode ───
  const exitGeoMode = () => {
    placeMarkers.current.forEach((m) => m.setMap(null));
    placeMarkers.current = [];
    if (singleMarker.current) { singleMarker.current.setMap(null); singleMarker.current = null; }
    if (geoCircle.current) { geoCircle.current.setMap(null); geoCircle.current = null; }
    if (directionsRenderer.current) { directionsRenderer.current.setMap(null); directionsRenderer.current = null; }
    setGeoMode(false);
    setGeoCenter(null);
    setActivePlaceCategory("");
    setSingleViewActive(false);
    if (mapInstance.current && properties.length > 0) {
      placePropertyMarkers(mapInstance.current, activeCategory, properties);
      mapInstance.current.setZoom(12);
    }
  };

  // ─── Render ───
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Back arrow when in Geographic/Direction/Single view */}
      {singleViewActive && !detailProperty && (
        <button
          onClick={exitGeoMode}
          className="absolute top-[130px] left-4 z-30 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          aria-label="Back to all properties"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      )}

      {!geoMode ? (
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          categoryTabs={CATEGORY_TABS}
          activeCategory={activeCategory}
          onCategoryChange={(name) => {
            setActiveCategory(name);
            if (mapInstance.current) placePropertyMarkers(mapInstance.current, name);
          }}
          onDirectionsClick={() => setShowDirections(true)}
        />
      ) : (
        <div className="absolute top-0 left-0 z-10 p-3 max-w-[420px]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-1">
            <button
              onClick={() => searchNearbyPlaces("school")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${activePlaceCategory === "school" ? "bg-green-600 text-white shadow" : "bg-white text-gray-700 border border-gray-200"}`}
            >
              🏫 Schools
            </button>
            <button
              onClick={() => searchNearbyPlaces("hospital")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${activePlaceCategory === "hospital" ? "bg-green-600 text-white shadow" : "bg-white text-gray-700 border border-gray-200"}`}
            >
              🏥 Hospitals
            </button>
            <button
              onClick={() => searchNearbyPlaces("park")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${activePlaceCategory === "park" ? "bg-green-600 text-white shadow" : "bg-white text-gray-700 border border-gray-200"}`}
            >
              🌳 Parks
            </button>
            <button
              onClick={() => setShowPlaceFilter(true)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
            >
              🔍 More
            </button>
          </div>
        </div>
      )}

      {/* Place Filter Modal */}
      {showPlaceFilter && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center" onClick={() => setShowPlaceFilter(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md p-5 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800">Nearby Places</h3>
              <button onClick={() => setShowPlaceFilter(false)} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "school", label: "🏫 Schools" },
                { type: "hospital", label: "🏥 Hospitals" },
                { type: "park", label: "🌳 Parks" },
                { type: "subway_station", label: "🚇 Metro" },
                { type: "bus_station", label: "🚌 Bus Stops" },
                { type: "restaurant", label: "🍽️ Restaurants" },
                { type: "bank", label: "🏦 Banks" },
                { type: "gas_station", label: "⛽ Petrol Pumps" },
                { type: "gym", label: "💪 Gyms" },
                { type: "supermarket", label: "🛒 Market" },
                { type: "shopping_mall", label: "🏬 Malls" },
                { type: "local_government_office", label: "🏛️ Govt Office" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => { searchNearbyPlaces(item.type); setShowPlaceFilter(false); }}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left transition ${activePlaceCategory === item.type ? "bg-green-100 border-green-500 border text-green-800" : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Guide */}
      <div className="absolute bottom-14 left-4 z-10">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-black/90 text-white rounded-full hover:bg-black transition text-sm shadow-lg">
          <span>🎧</span>
          <span>24/7 AI Guide</span>
        </button>
      </div>

      <IncompletePanel
        show={showIncomplete}
        items={incompleteProperties}
        onClose={() => setShowIncomplete(false)}
        onSelect={(p) => setDetailProperty(p)}
      />

      <MapButtons
        incompleteCount={incompleteProperties.length}
        onIncompleteClick={() => setShowIncomplete(!showIncomplete)}
        onDirectionsClick={() => setShowDirections(true)}
        onLocationClick={getUserLocation}
      />

      <DirectionsPanel
        show={showDirections}
        properties={properties}
        onClose={() => setShowDirections(false)}
        onNavigate={handleNavigate}
        onPropertyClick={(property) => {
          setDetailProperty(property);
          if (mapInstance.current) {
            const map = mapInstance.current;
            // Clear all property overlays
            overlays.current.forEach((o) => (o as unknown as { remove: () => void }).remove());
            overlays.current = [];
            // Remove previous single marker if any
            if (singleMarker.current) { singleMarker.current.setMap(null); singleMarker.current = null; }
            // Pan and zoom to property
            map.panTo({ lat: property.lat, lng: property.lng });
            map.setZoom(15);
            // Place standard Google Maps pin
            singleMarker.current = new window.google.maps.Marker({
              position: { lat: property.lat, lng: property.lng },
              map,
              title: property.property_name,
            });
          }
        }}
      />

      <DetailPanel
        property={detailProperty}
        onClose={() => {
          setDetailProperty(null);
          // Remove single marker pin
          if (singleMarker.current) { singleMarker.current.setMap(null); singleMarker.current = null; }
          // Remove geographic circle
          if (geoCircle.current) { geoCircle.current.setMap(null); geoCircle.current = null; }
          // Restore all property markers
          if (mapInstance.current && properties.length > 0) {
            placePropertyMarkers(mapInstance.current, activeCategory, properties);
          }
        }}
        onDirections={handleDetailDirections}
        onGeographic={() => {
          if (!detailProperty || !mapInstance.current) return;
          const map = mapInstance.current;
          const lat = detailProperty.lat;
          const lng = detailProperty.lng;
          // Clear all overlays
          overlays.current.forEach((o) => (o as unknown as { remove: () => void }).remove());
          overlays.current = [];
          // Remove previous single marker
          if (singleMarker.current) { singleMarker.current.setMap(null); singleMarker.current = null; }
          // Pan and zoom
          map.panTo({ lat, lng });
          map.setZoom(14);
          // Place standard Google Maps pin
          singleMarker.current = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: detailProperty.property_name,
          });
          // Draw red circle around property
          if (geoCircle.current) { geoCircle.current.setMap(null); geoCircle.current = null; }
          geoCircle.current = new window.google.maps.Circle({
            map,
            center: { lat, lng },
            radius: 2500,
            fillColor: "#16a34a",
            fillOpacity: 0.05,
            strokeColor: "#16a34a",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          });
          // Close panel on mobile so map is visible
          setDetailProperty(null);
          setSingleViewActive(true);
          setGeoMode(true);
          setGeoCenter({ lat, lng });
        }}
        on3DView={handle3DView}
        onImmersiveView={handleImmersiveView}
      />

      <StreetViewOverlay
        coords={streetViewCoords}
        onClose={() => setStreetViewCoords(null)}
      />
    </div>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
