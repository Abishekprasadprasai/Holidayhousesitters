import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
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

type Profile = {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  location?: string;
  photo_url?: string;
  skills?: string[];
  role: "sitter" | "homeowner";
  lat?: number;
  lng?: number;
};

type MapViewProps = {
  profiles: Profile[];
  selectedProfileId?: string;
  onProfileClick: (profileId: string) => void;
};

function MapUpdater({ profiles }: { profiles: Profile[] }) {
  const map = useMap();

  useEffect(() => {
    if (profiles.length > 0) {
      const validProfiles = profiles.filter(p => p.lat && p.lng);
      if (validProfiles.length > 0) {
        const bounds = L.latLngBounds(
          validProfiles.map(p => [p.lat!, p.lng!])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [profiles, map]);

  return null;
}

export function MapView({ profiles, selectedProfileId, onProfileClick }: MapViewProps) {
  const [highlightedId, setHighlightedId] = useState<string | undefined>(selectedProfileId);

  useEffect(() => {
    setHighlightedId(selectedProfileId);
  }, [selectedProfileId]);

  // Default center (Sydney, Australia)
  const defaultCenter: [number, number] = [-33.8688, 151.2093];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater profiles={profiles} />

        {profiles
          .filter(profile => profile.lat && profile.lng)
          .map((profile) => (
            <Marker
              key={profile.id}
              position={[profile.lat!, profile.lng!]}
              icon={profile.role === "sitter" ? sitterIcon : homeownerIcon}
              eventHandlers={{
                click: () => onProfileClick(profile.id),
              }}
              opacity={highlightedId === profile.id ? 1 : 0.7}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold mb-1">{profile.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize mb-1">
                    {profile.role}
                  </p>
                  {profile.location && (
                    <p className="text-xs text-muted-foreground">{profile.location}</p>
                  )}
                  {profile.bio && (
                    <p className="text-xs mt-2 line-clamp-2">{profile.bio}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
