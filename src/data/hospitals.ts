export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private';
  distance: number; // in km
  lat: number;
  lng: number;
  rating: number;      // e.g. 4.2
  beds: number;        // e.g. 1200
  priceInfo: string;   // e.g. "Free / Nominal"
  facilities: string;  // e.g. "General + Emergency"
}

export const hospitals: Hospital[] = [
  {
    id: "h1",
    name: "Govt. Medical College & Hospital",
    type: "Government",
    distance: 1.2,
    lat: 21.1350,
    lng: 79.0950,
    rating: 4.2,
    beds: 1200,
    priceInfo: "Free / Nominal",
    facilities: "General + Emergency"
  },
  {
    id: "h2",
    name: "IGGM Hospital (Indira Gandhi)",
    type: "Government",
    distance: 2.1,
    lat: 21.1490,
    lng: 79.0805,
    rating: 4.0,
    beds: 650,
    priceInfo: "Free / Nominal",
    facilities: "General + Maternity"
  },
  {
    id: "h3",
    name: "Orange City Hospital",
    type: "Private",
    distance: 4.5,
    lat: 21.1302,
    lng: 79.0689,
    rating: 4.5,
    beds: 300,
    priceInfo: "₹400–₹1500+",
    facilities: "Emergency + Surgery"
  },
  {
    id: "h4",
    name: "AIIMS Nagpur",
    type: "Government",
    distance: 8.2,
    lat: 21.0505,
    lng: 79.0304,
    rating: 4.8,
    beds: 1500,
    priceInfo: "Free / Nominal",
    facilities: "Advanced + Research"
  }
];
