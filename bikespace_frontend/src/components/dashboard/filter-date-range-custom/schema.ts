import * as z from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

// Zod 4 reports an Invalid Date as `invalid_type` (there is no `invalid_date`
// code) and no longer says "Required" for a missing value.
const dateError =
  (invalidDateMessage: string) =>
  (issue: {input?: unknown}): string | undefined => {
    if (issue.input === undefined) return 'Required';
    if (issue.input instanceof Date) return invalidDateMessage;
    return undefined; // fall back to Zod's default message
  };

export const customDateRangeSchema = z
  .object({
    from: z.date({error: dateError('Please enter a valid start date.')}),
    to: z.date({error: dateError('Please enter a valid end date.')}),
  })
  .refine(({from, to}) => to >= from, {
    message: 'End date cannot be before start date.',
    path: ['to'],
  });

export type CustomDateRangeSchema = z.infer<typeof customDateRangeSchema>;

export const customDateRangeSchemaResolver = zodResolver(customDateRangeSchema);
