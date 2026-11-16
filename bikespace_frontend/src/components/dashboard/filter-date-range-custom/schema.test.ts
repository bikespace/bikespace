import {customDateRangeSchema} from './schema';

const validDate = new Date('2024-02-01T00:00:00');
const invalidDate = new Date('not a date');

function messagesFor(input: unknown, field: 'from' | 'to') {
  const result = customDateRangeSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues
    .filter(issue => issue.path[0] === field)
    .map(issue => issue.message);
}

describe('customDateRangeSchema', () => {
  test('accepts a valid range', () => {
    expect(
      customDateRangeSchema.safeParse({from: validDate, to: validDate}).success
    ).toBe(true);
  });

  test('an invalid start date shows the start date message', () => {
    expect(messagesFor({from: invalidDate, to: validDate}, 'from')).toEqual([
      'Please enter a valid start date.',
    ]);
  });

  test('an invalid end date shows the end date message', () => {
    expect(messagesFor({from: validDate, to: invalidDate}, 'to')).toEqual([
      'Please enter a valid end date.',
    ]);
  });

  test('a missing start date is required', () => {
    expect(messagesFor({from: undefined, to: validDate}, 'from')).toEqual([
      'Required',
    ]);
  });

  test('a missing end date is required', () => {
    expect(messagesFor({from: validDate, to: undefined}, 'to')).toEqual([
      'Required',
    ]);
  });

  test('an end date before the start date is rejected', () => {
    expect(
      messagesFor({from: validDate, to: new Date('2024-01-31T00:00:00')}, 'to')
    ).toEqual(['End date cannot be before start date.']);
  });
});
