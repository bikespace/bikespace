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

export interface Time {
    date: Date;
    parkingDuration: ParkingDuration;
}

export default interface Submission {
  issues: IssueType[];
  longitude: number;
  latitude: number;
  time: Time,
  comment: Comment
}
