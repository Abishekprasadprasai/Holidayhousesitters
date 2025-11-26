import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

type Listing = {
  id: string;
  title: string;
  type: 'house_sit' | 'sitter';
  suburb: string;
  latitude: number;
  longitude: number;
};

interface LocationMapProps {
  listings: Listing[];
}

// Custom marker icons
const houseSitIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sitterIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const LocationMap = ({ listings }: LocationMapProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-37.8136, 144.9631]); // Melbourne default
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  useEffect(() => {
    if (listings.length > 0) {
      // Calculate bounds to fit all markers
      const lats = listings.map(l => l.latitude);
      const lngs = listings.map(l => l.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      setMapBounds([[minLat, minLng], [maxLat, maxLng]]);
      
      // Set center to average of all markers
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [listings]);

  const mapProps = mapBounds 
    ? { bounds: mapBounds, center: mapCenter }
    : { center: mapCenter, zoom: 6 };

  return (
    <div className="w-full h-[350px] md:h-[450px] rounded-2xl shadow-md overflow-hidden">
      <MapContainer
        {...mapProps}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={listing.type === 'house_sit' ? houseSitIcon : sitterIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {listing.type === 'house_sit' ? 'House Sit' : 'Sitter'}
                </p>
                <p className="text-xs">{listing.suburb}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
