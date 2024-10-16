import * as z from 'zod';

import {IssueType, ParkingDuration} from '@/interfaces/Submission';
import {useFormContext} from 'react-hook-form';

export const submissionSchema = z.object({
  issues: z
    .array(z.nativeEnum(IssueType))
    .min(1, 'Please select at least one issue.'),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  parkingTime: z.object({
    date: z.date(),
    parkingDuration: z.nativeEnum(ParkingDuration),
  }),
  comments: z.string(),
});

export type SubmissionSchema = z.infer<typeof submissionSchema>;

export const useSubmissionFormContext = () => {
  return useFormContext<SubmissionSchema>();
};
