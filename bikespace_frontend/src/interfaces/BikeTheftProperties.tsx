export interface BikeTheftProperties {
  _id: number;
  EVENT_UNIQUE_ID: string;
  PRIMARY_OFFENCE: string;
  OCC_DATE: string;
  BIKE_MAKE: string;
  BIKE_MODEL: string;
  BIKE_TYPE: string;
  BIKE_COLOUR: string;
  BIKE_COST: number;
  STATUS: string; // "STOLEN" or "RECOVERED"
  LOCATION_TYPE: string;
  PREMISES_TYPE: string;
  LONG_WGS84: number;
  LAT_WGS84: number;
}
