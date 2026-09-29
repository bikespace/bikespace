export enum BikeTheftStatusFilter {
  All = 'all',
  Stolen = 'stolen',
  Recovered = 'recovered',
}

export interface StolenBikeReport {
  id: string;
  date: string; // ISO date string e.g. "2024-03-15"
  location: string; // Human-readable address or area
  bikeType: string; // e.g. "Road bike", "Mountain bike"
  color: string;
  description: string;
  status: 'stolen' | 'recovered' | 'unknown';
  latitude: number;
  longitude: number;
}
