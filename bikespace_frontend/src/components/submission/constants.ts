import {FieldPath} from 'react-hook-form';
import {SubmissionSchema} from './schema';

export const formOrder = [
  'issues',
  'location',
  'parkingTime',
  'comments',
  'summary',
] as FormOrder[];

export type FormOrder = FieldPath<SubmissionSchema> | 'summary';
