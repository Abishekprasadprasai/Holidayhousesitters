// Simple geocoding cache to avoid repeated API calls
const geocodeCache = new Map<string, { lat: number; lng: number }>();

// Nominatim API - free geocoding service (1 request per second limit)
export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  // Check cache first
  const cached = geocodeCache.get(location.toLowerCase());
  if (cached) return cached;

  try {
    // Add a small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location + ", Australia"
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "HouseSittingApp/1.0",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.length === 0) return null;

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    // Cache the result
    geocodeCache.set(location.toLowerCase(), result);
    return result;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Batch geocode multiple locations with rate limiting
export async function geocodeLocations(locations: string[]): Promise<Map<string, { lat: number; lng: number }>> {
  const results = new Map<string, { lat: number; lng: number }>();
  const uniqueLocations = [...new Set(locations.filter(Boolean))];

  for (const location of uniqueLocations) {
    const coords = await geocodeLocation(location);
    if (coords) {
      results.set(location, coords);
    }
  }

  return results;
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
