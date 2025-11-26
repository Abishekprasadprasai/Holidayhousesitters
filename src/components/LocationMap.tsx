import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Listing = {
  id: string;
  title: string;
  type: 'house_sit' | 'sitter';
  suburb: string;
  latitude: number;
  longitude: number;
};

interface LocationMapProps {
  listings?: Listing[];
}

const defaultCenter: [number, number] = [-25.2744, 133.7751]; // Australia

function LocationMap({ listings = [] }: LocationMapProps) {
  const hasListings = listings && listings.length > 0;

  const center: [number, number] = hasListings
    ? [listings[0].latitude, listings[0].longitude]
    : defaultCenter;

  return (
    <div className="w-full h-[320px] md:h-[420px] rounded-2xl shadow-md overflow-hidden">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {hasListings &&
          listings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
            >
              <Popup>
                <div className="font-semibold">{listing.title}</div>
                <div className="text-xs text-muted-foreground">
                  {listing.type === "house_sit" ? "House Sit" : "Sitter"} –{" "}
                  {listing.suburb}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default LocationMap;
