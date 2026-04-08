export interface LocationSuggestion {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type?: string;
  class?: string;
  source?: 'coords' | 'nominatim';
}

const searchCache = new Map<string, LocationSuggestion[]>();

const WATER_TYPES = new Set(['reservoir', 'lake', 'water', 'river', 'riverbank', 'canal', 'dam']);

function normalizeLabel(item: any): string {
  const address = item.address ?? {};
  const primary = address.attraction || address.water || address.natural || address.amenity || address.city || address.town || address.village || item.name;
  const municipality = address.city || address.town || address.village || address.municipality || address.county;
  const country = 'България';
  const parts = [primary, municipality, country].filter(Boolean).map((part) => String(part));
  return parts.join(', ');
}

function isWaterRelevant(item: any) {
  return WATER_TYPES.has(String(item.type ?? '').toLowerCase()) || WATER_TYPES.has(String(item.class ?? '').toLowerCase());
}

export function parseCoordinateQuery(query: string): { latitude: number; longitude: number } | null {
  const match = query
    .trim()
    .match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

export function createCoordinateSuggestion(query: string): LocationSuggestion | null {
  const parsed = parseCoordinateQuery(query);
  if (!parsed) return null;
  return {
    id: `coords:${parsed.latitude.toFixed(4)},${parsed.longitude.toFixed(4)}`,
    name: 'Координати',
    displayName: `Координати: ${parsed.latitude.toFixed(4)}, ${parsed.longitude.toFixed(4)}`,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    source: 'coords',
    type: 'coordinate',
    class: 'coordinate',
  };
}

export async function searchLocationsInBg(query: string, signal?: AbortSignal): Promise<LocationSuggestion[]> {
  const key = query.trim().toLowerCase();
  if (!key) return [];
  if (searchCache.has(key)) return searchCache.get(key)!;

  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    countrycodes: 'bg',
    'accept-language': 'bg',
    limit: '8',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Search API error');
  const data = await res.json();

  const normalized: LocationSuggestion[] = (Array.isArray(data) ? data : [])
    .map((item: any) => ({
      id: String(item.place_id),
      name: item.name || item.display_name || '',
      displayName: normalizeLabel(item),
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      type: item.type,
      class: item.class,
      source: 'nominatim' as const,
    }))
    .filter((item: LocationSuggestion) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

  const unique = new Map<string, LocationSuggestion>();
  for (const item of normalized) {
    const dedupeKey = `${item.displayName}|${item.latitude.toFixed(4)}|${item.longitude.toFixed(4)}`;
    if (!unique.has(dedupeKey)) unique.set(dedupeKey, item);
  }

  const deduped = Array.from(unique.values());
  const boosted = deduped.sort((a, b) => {
    const aWater = isWaterRelevant(a);
    const bWater = isWaterRelevant(b);
    if (aWater === bWater) return 0;
    return aWater ? -1 : 1;
  });

  searchCache.set(key, boosted);
  return boosted;
}

export async function buildLocationSuggestions(query: string, signal?: AbortSignal): Promise<LocationSuggestion[]> {
  const coordsSuggestion = createCoordinateSuggestion(query);
  const nominatimResults = await searchLocationsInBg(query, signal);
  if (!coordsSuggestion) return nominatimResults;
  return [coordsSuggestion, ...nominatimResults];
}
