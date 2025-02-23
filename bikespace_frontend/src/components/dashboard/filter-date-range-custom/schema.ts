import * as z from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

export const customDateRangeSchema = z
  .object({
    from: z.date({
      errorMap: (issue, {defaultError}) => ({
        message:
          issue.code === 'invalid_date'
            ? 'Please enter a valid start date.'
            : defaultError,
      }),
    }),
    to: z.date({
      errorMap: (issue, {defaultError}) => ({
        message:
          issue.code === 'invalid_date'
            ? 'Please enter a valid end date.'
            : defaultError,
      }),
    }),
  })
  .refine(({from, to}) => to >= from, {
    message: 'End date cannot be before start date.',
    path: ['to'],
  });

export type CustomDateRangeSchema = z.infer<typeof customDateRangeSchema>;

export const customDateRangeSchemaResolver = zodResolver(customDateRangeSchema);
