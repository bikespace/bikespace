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

export interface SubmissionStatus {
  status: string;
}

export default interface Submission {
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
}

export interface SubmissionFilters {
  dateRange: {
    from: Date;
    to: Date;
  } | null;
  parkingDuration: ParkingDuration[];
  issue: IssueType | null;
  day: Day | null;
}

export enum Day {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}
