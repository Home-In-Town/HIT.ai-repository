// Google Maps type declarations
declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
    setCenter(latlng: LatLngLiteral): void;
    setZoom(zoom: number): void;
    panTo(latlng: LatLngLiteral): void;
  }

  interface MapOptions {
    center?: LatLngLiteral;
    zoom?: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    keyboardShortcuts?: boolean;
    styles?: MapTypeStyle[];
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface MapTypeStyle {
    featureType?: string;
    elementType?: string;
    stylers: { [key: string]: string }[];
  }

  enum SymbolPath {
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
  }

  interface Symbol {
    path: SymbolPath | string;
    scale?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
  }

  interface Point {
    x: number;
    y: number;
  }

  class Marker {
    constructor(options?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latlng: LatLngLiteral): void;
    addListener(event: string, handler: () => void): void;
  }

  interface MarkerOptions {
    position?: LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Symbol;
  }

  class Circle {
    constructor(options?: CircleOptions);
    setMap(map: Map | null): void;
  }

  interface CircleOptions {
    map?: Map;
    center?: LatLngLiteral;
    radius?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  class OverlayView {
    setMap(map: Map | null): void;
    getMap(): Map | null;
    getPanes(): MapPanes | null;
    getProjection(): MapCanvasProjection | null;
    onAdd(): void;
    draw(): void;
    onRemove(): void;
  }

  interface MapPanes {
    floatPane: HTMLElement;
    mapPane: HTMLElement;
    markerLayer: HTMLElement;
    overlayLayer: HTMLElement;
    overlayMouseTarget: HTMLElement;
  }

  interface MapCanvasProjection {
    fromLatLngToDivPixel(latLng: LatLng): Point | null;
    fromDivPixelToLatLng(pixel: Point): LatLng;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(opts: { anchor?: Marker; map?: Map }): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement;
    maxWidth?: number;
  }

  const ControlPosition: {
    TOP_LEFT: number;
    TOP_CENTER: number;
    TOP_RIGHT: number;
    LEFT_TOP: number;
    LEFT_CENTER: number;
    LEFT_BOTTOM: number;
    RIGHT_TOP: number;
    RIGHT_CENTER: number;
    RIGHT_BOTTOM: number;
    BOTTOM_LEFT: number;
    BOTTOM_CENTER: number;
    BOTTOM_RIGHT: number;
  };
}

declare namespace google.maps {
  class DirectionsService {
    route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: string) => void): void;
  }

  class DirectionsRenderer {
    constructor(options?: DirectionsRendererOptions);
    setMap(map: Map | null): void;
    setDirections(result: DirectionsResult | null): void;
  }

  interface DirectionsRequest {
    origin: LatLngLiteral | string;
    destination: LatLngLiteral | string;
    travelMode: string;
  }

  interface DirectionsResult {
    routes: unknown[];
  }

  interface DirectionsRendererOptions {
    suppressMarkers?: boolean;
    polylineOptions?: {
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
    };
  }

  const TravelMode: {
    DRIVING: string;
    WALKING: string;
    BICYCLING: string;
    TRANSIT: string;
  };
}
