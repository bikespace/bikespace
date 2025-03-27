export enum IssueType {
  NotProvided = 'not_provided',
  Full = 'full',
  Damaged = 'damaged',
  Abandoned = 'abandoned',
  Other = 'other',
}

export interface LocationLatLng {
  latitude: number;
  longitude: number;
}

export enum ParkingDuration {
  Minutes = 'minutes',
  Hours = 'hours',
  Overnight = 'overnight',
  MultiDay = 'multiday',
}

export interface ParkingTime {
  date: Date;
  parkingDuration: ParkingDuration;
}

export interface SubmissionResponsePayload {
  status: string;
}

export enum SubmissionStatus {
  Summary = 'summary',
  Success = 'success',
  Error = 'error',
}

export interface Submission {
  issues: IssueType[];
  location: LocationLatLng;
  parkingTime: ParkingTime;
  comments: String;
}

export interface SubmissionPayload {
  latitude: number;
  longitude: number;
  issues: IssueType[];
  parking_time: Date;
  parking_duration: ParkingDuration;
  comments: String;
}

export interface SubmissionApiPayload {
  id: number;
  latitude: number;
  longitude: number;
  issues: IssueType[];
  parking_time: string;
  parking_duration: ParkingDuration;
  comments: String;
  submitted_datetime: string | null;
}

export enum DateRangeInterval {
  AllDates = 'all_dates',
  Last7Days = 'last_7_days',
  Last30Days = 'last_30_days',
  Last90Days = 'last_90_days',
  Last12Months = 'last_12_months',
  ThisYear = 'this_year',
  LastYear = 'last_year',
  CustomRange = 'custom_range',
}

export interface SubmissionFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  dateRangeInterval: DateRangeInterval | null;
  parkingDuration: ParkingDuration[];
  issue: IssueType | null;
  day: Day | null;
}

export enum Day {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 0,
}

export type SubmissionsDateRange = {
  first: Date | null;
  last: Date | null;
};
