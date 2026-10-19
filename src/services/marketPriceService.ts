import { MandiComparison } from '../types';

export interface MarketPriceResult {
  crop: string;
  cropDisplayName: string;
  location: string;
  radiusKm: number;
  mandis: MandiComparison[];
  recommendedMandi: MandiComparison;
  stats: {
    highestPrice: number;
    lowestPrice: number;
    avgPrice: number;
    modalPrice: number;
  };
  asOfDate: string;
  source: string;
  isDemonstrationData: boolean;
  assumptions: string;
}

// Distance matrix (approximate road km) between major APMC Mandi clusters in Andhra Pradesh / Telangana
const apmcLocations: Record<string, { lat: number; lon: number; state: string }> = {
  'Vijayawada': { lat: 16.5062, lon: 80.6480, state: 'Andhra Pradesh' },
  'Guntur': { lat: 16.3067, lon: 80.4365, state: 'Andhra Pradesh' },
  'Tenali': { lat: 16.2430, lon: 80.6400, state: 'Andhra Pradesh' },
  'Eluru': { lat: 16.7107, lon: 81.0952, state: 'Andhra Pradesh' },
  'Nellore': { lat: 14.4426, lon: 79.9865, state: 'Andhra Pradesh' },
  'Khammam': { lat: 17.2473, lon: 80.1514, state: 'Telangana' },
  'Kurnool': { lat: 15.8281, lon: 78.0373, state: 'Andhra Pradesh' },
  'Amaravati': { lat: 16.5131, lon: 80.5165, state: 'Andhra Pradesh' },
  'Tirupati': { lat: 13.6288, lon: 79.4192, state: 'Andhra Pradesh' },
  'Warangal': { lat: 17.9689, lon: 79.5941, state: 'Telangana' },
  'Hyderabad': { lat: 17.3850, lon: 78.4867, state: 'Telangana' },
};

// Base benchmark modal prices (in ₹/kg) for crops across APMCs
interface CropMandiBase {
  mandiName: string;
  mandiCluster: string;
  basePrice: number; // ₹/kg
  demand: 'High' | 'Medium' | 'Low';
  mandiCessPercent: number; // e.g. 0.01 for 1%
  handlingRatePerKg: number; // ₹/kg
}

const cropMandiBasePrices: Record<string, CropMandiBase[]> = {
  tomato: [
    { mandiName: 'Tenali Mandi', mandiCluster: 'Tenali', basePrice: 32.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.20 },
    { mandiName: 'Guntur Mandi', mandiCluster: 'Guntur', basePrice: 30.5, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.18 },
    { mandiName: 'Vijayawada APMC', mandiCluster: 'Vijayawada', basePrice: 28.5, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Eluru Mandi', mandiCluster: 'Eluru', basePrice: 29.0, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Khammam Mandi', mandiCluster: 'Khammam', basePrice: 27.5, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.18 },
    { mandiName: 'Nellore Mandi', mandiCluster: 'Nellore', basePrice: 26.5, demand: 'Low', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Kurnool APMC', mandiCluster: 'Kurnool', basePrice: 25.0, demand: 'Low', mandiCessPercent: 0.01, handlingRatePerKg: 0.20 },
  ],
  paddy: [
    { mandiName: 'Tenali Mandi', mandiCluster: 'Tenali', basePrice: 33.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.20 },
    { mandiName: 'Vijayawada APMC', mandiCluster: 'Vijayawada', basePrice: 31.5, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.18 },
    { mandiName: 'Guntur Mandi', mandiCluster: 'Guntur', basePrice: 30.0, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.18 },
    { mandiName: 'Eluru Mandi', mandiCluster: 'Eluru', basePrice: 29.5, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Khammam Mandi', mandiCluster: 'Khammam', basePrice: 28.5, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.18 },
    { mandiName: 'Nellore Mandi', mandiCluster: 'Nellore', basePrice: 27.0, demand: 'Low', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
  ],
  chilli: [
    { mandiName: 'Guntur Mandi', mandiCluster: 'Guntur', basePrice: 154.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.50 },
    { mandiName: 'Khammam Mandi', mandiCluster: 'Khammam', basePrice: 147.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.45 },
    { mandiName: 'Vijayawada APMC', mandiCluster: 'Vijayawada', basePrice: 142.0, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.40 },
    { mandiName: 'Tenali Mandi', mandiCluster: 'Tenali', basePrice: 139.0, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.40 },
    { mandiName: 'Warangal Mandi', mandiCluster: 'Warangal', basePrice: 145.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.45 },
  ],
  cotton: [
    { mandiName: 'Guntur Mandi', mandiCluster: 'Guntur', basePrice: 75.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.30 },
    { mandiName: 'Khammam Mandi', mandiCluster: 'Khammam', basePrice: 73.5, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.28 },
    { mandiName: 'Vijayawada APMC', mandiCluster: 'Vijayawada', basePrice: 71.0, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.25 },
    { mandiName: 'Warangal Mandi', mandiCluster: 'Warangal', basePrice: 74.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.30 },
    { mandiName: 'Kurnool APMC', mandiCluster: 'Kurnool', basePrice: 70.0, demand: 'Low', mandiCessPercent: 0.01, handlingRatePerKg: 0.25 },
  ],
  potato: [
    { mandiName: 'Vijayawada APMC', mandiCluster: 'Vijayawada', basePrice: 27.0, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Tenali Mandi', mandiCluster: 'Tenali', basePrice: 25.5, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Guntur Mandi', mandiCluster: 'Guntur', basePrice: 25.0, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Eluru Mandi', mandiCluster: 'Eluru', basePrice: 24.5, demand: 'Low', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
  ],
  maize: [
    { mandiName: 'Guntur Mandi', mandiCluster: 'Guntur', basePrice: 23.5, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Khammam Mandi', mandiCluster: 'Khammam', basePrice: 22.8, demand: 'High', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Vijayawada APMC', mandiCluster: 'Vijayawada', basePrice: 22.0, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
    { mandiName: 'Tenali Mandi', mandiCluster: 'Tenali', basePrice: 21.5, demand: 'Medium', mandiCessPercent: 0.01, handlingRatePerKg: 0.15 },
  ],
};

// Calculate Haversine distance in km between two lat/lon pairs
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Find closest APMC cluster for an arbitrary user location string
function resolveUserCoordinates(userLocation: string): { name: string; lat: number; lon: number } {
  const clean = userLocation.toLowerCase();
  for (const [name, coords] of Object.entries(apmcLocations)) {
    if (clean.includes(name.toLowerCase())) {
      return { name, lat: coords.lat, lon: coords.lon };
    }
  }
  // Default fallback cluster: Vijayawada
  return { name: 'Vijayawada', lat: 16.5062, lon: 80.6480 };
}

export function computeMarketPrices(
  rawCrop: string,
  userLocation: string,
  radiusKm = 150
): MarketPriceResult {
  const cleanCrop = (rawCrop || 'tomato').toLowerCase().trim();
  const cropKey = cleanCrop.includes('paddy') || cleanCrop.includes('rice')
    ? 'paddy'
    : cleanCrop.includes('chilli')
    ? 'chilli'
    : cleanCrop.includes('cotton')
    ? 'cotton'
    : cleanCrop.includes('potato')
    ? 'potato'
    : cleanCrop.includes('maize')
    ? 'maize'
    : 'tomato';

  const userCoords = resolveUserCoordinates(userLocation || 'Vijayawada');
  const cropList = cropMandiBasePrices[cropKey] || cropMandiBasePrices.tomato;

  const mandisWithCalculations: MandiComparison[] = cropList
    .map((item, index) => {
      const mandiCoords = apmcLocations[item.mandiCluster] || { lat: 16.5, lon: 80.6, state: 'AP' };
      let dist = calculateHaversineDistance(
        userCoords.lat,
        userCoords.lon,
        mandiCoords.lat,
        mandiCoords.lon
      );

      // Add minimum distance if same city
      if (dist === 0) {
        dist = 8; // Local intra-city mandi distance
      }

      // Transportation cost model: ₹0.0075 per kg per km + small base loading of ₹0.05/kg
      const transportCost = Math.round((0.05 + dist * 0.0075) * 100) / 100;
      // Mandi cess: 1% of gross price
      const mandiCess = Math.round(item.basePrice * item.mandiCessPercent * 100) / 100;
      // Handling charge: e.g. ₹0.15 - ₹0.50/kg
      const handling = item.handlingRatePerKg;
      // Total other charges
      const otherCharges = Math.round((mandiCess + handling + transportCost) * 100) / 100;
      // Estimated Net Return = Gross - Other Charges
      const estimatedNetReturn = Math.round((item.basePrice - otherCharges) * 100) / 100;

      return {
        id: `mandi-${cropKey}-${index}-${item.mandiCluster.toLowerCase()}`,
        marketName: item.mandiName,
        distanceKm: dist,
        marketPrice: item.basePrice,
        otherCharges,
        estimatedNetReturn,
        demand: item.demand,
        isRecommended: false,
        cessBreakdown: {
          mandiCess,
          handling,
          transport: transportCost,
        },
      };
    })
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => b.estimatedNetReturn - a.estimatedNetReturn);

  // If filter excluded everything (e.g. radius too small), include at least the nearest mandi
  const finalMandis = mandisWithCalculations.length > 0 ? mandisWithCalculations : [
    {
      id: `mandi-${cropKey}-nearest`,
      marketName: `${userCoords.name} APMC Mandi`,
      distanceKm: 12,
      marketPrice: cropList[0].basePrice,
      otherCharges: 0.45,
      estimatedNetReturn: Math.round((cropList[0].basePrice - 0.45) * 100) / 100,
      demand: 'High' as const,
      isRecommended: true,
      cessBreakdown: { mandiCess: 0.20, handling: 0.15, transport: 0.10 },
    },
  ];

  // Mark the #1 net return mandi as recommended
  if (finalMandis.length > 0) {
    finalMandis[0].isRecommended = true;
  }

  const prices = finalMandis.map((m) => m.marketPrice);
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);
  const avgPrice = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
  const sorted = [...prices].sort((a, b) => a - b);
  const modalPrice = sorted[Math.floor(sorted.length / 2)];

  const cropDisplayNames: Record<string, string> = {
    tomato: 'Tomato (🍅 టమోటా)',
    paddy: 'Paddy / Rice (🌾 వరి)',
    chilli: 'Chilli (🌶️ మిర్చి)',
    cotton: 'Cotton (☁️ ప్రత్తి)',
    potato: 'Potato (🥔 బంగాళాదుంప)',
    maize: 'Maize (🌽 మొక్కజొన్న)',
  };

  return {
    crop: cropKey,
    cropDisplayName: cropDisplayNames[cropKey] || cropKey,
    location: userLocation,
    radiusKm,
    mandis: finalMandis,
    recommendedMandi: finalMandis[0],
    stats: {
      highestPrice,
      lowestPrice,
      avgPrice,
      modalPrice,
    },
    asOfDate: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    source: 'Agmarknet (Govt. of India) APMC Daily Trading Bulletins',
    isDemonstrationData: true,
    assumptions:
      'Demonstration Benchmark Data: Modal prices referenced from daily Andhra Pradesh & Telangana APMC bulletins. Transport estimated at ₹7.50/tonne-km. Mandi cess estimated at 1% of market price.',
  };
}
