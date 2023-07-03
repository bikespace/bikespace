export enum IssueType {
  NotProvided = "not_provided",
  Full = "full",
  Damaged = "damaged",
  Abandoned = "abandoned",
  Other = "other",
}

export interface LocationLatLng {
  latitude: number;
  longitude: number;
}

export enum ParkingDuration {
    Minutes = "minutes",
    Hours = "hours",
    Overnight = "overnight",
    MultiDay = "multiday"
}

export interface ParkingTime {
    date: Date;
    parkingDuration: ParkingDuration;
}

export default interface Submission {
  issues: IssueType[],
  location: LocationLatLng,
  parkingTime: ParkingTime,
  comments: String
}
