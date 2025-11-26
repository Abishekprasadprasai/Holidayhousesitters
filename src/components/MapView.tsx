import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icons for different roles
const sitterIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "hue-rotate-[240deg]", // Blue tint for sitters
});

const homeownerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "hue-rotate-[120deg]", // Green tint for homeowners
});

const vetNurseIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "hue-rotate-[300deg]", // Purple/pink tint for vet nurses
});

type Profile = {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  location?: string;
  photo_url?: string;
  skills?: string[];
  role: "sitter" | "homeowner" | "vet_nurse";
  lat?: number;
  lng?: number;
};

type MapViewProps = {
  profiles: Profile[];
  selectedProfileId?: string;
  onProfileClick: (profileId: string) => void;
};

export function MapView({ profiles, selectedProfileId, onProfileClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Default center (Sydney, Australia)
  const defaultCenter: [number, number] = [-33.8688, 151.2093];

  // Initialize the map once on the client
  useEffect(() => {
    if (!isClient || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(defaultCenter, 10);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [isClient]);

  // Update markers when profiles or selection change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    const validProfiles = profiles.filter((p) => p.lat && p.lng);

    validProfiles.forEach((profile) => {
      const marker = L.marker([profile.lat!, profile.lng!], {
        icon: profile.role === "sitter" ? sitterIcon : profile.role === "vet_nurse" ? vetNurseIcon : homeownerIcon,
        opacity: selectedProfileId && selectedProfileId !== profile.id ? 0.7 : 1,
      }).addTo(layer);

      marker.on("click", () => onProfileClick(profile.id));

      const popupContent = `
        <div class="text-sm">
          <h3 class="font-semibold mb-1">${profile.name}</h3>
          <p class="text-xs capitalize mb-1">${profile.role}</p>
          ${profile.location ? `<p class="text-xs text-muted-foreground">${profile.location}</p>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Fit bounds to markers
    if (validProfiles.length > 0) {
      const bounds = L.latLngBounds(validProfiles.map((p) => [p.lat!, p.lng!]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else {
      mapRef.current.setView(defaultCenter, 10);
    }
  }, [profiles, selectedProfileId, onProfileClick]);

  if (!isClient) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
