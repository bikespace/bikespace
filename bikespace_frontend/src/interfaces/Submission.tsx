export enum IssueType {
  NotProvided = "note_provided",
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

export default interface Submission {
  comments: IssueType[];
  longitude: number;
  latitude: number;
  parkingDuration: ParkingDuration,
}
