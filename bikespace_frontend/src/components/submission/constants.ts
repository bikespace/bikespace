export const formOrder = [
  'issues',
  'location',
  'parkingTime',
  'comments',
  'summary',
] as FormOrder[];

export type FormOrder =
  | 'issues'
  | 'location'
  | 'parkingTime'
  | 'comments'
  | 'summary';
