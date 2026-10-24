import {titleCase, sentenceCase} from './textUtils';

describe('textUtils', () => {
  test.each([
    {input: 'I Love BBQ', expected: 'I Love Bbq'},
    {input: 'i love bbq', expected: 'I Love Bbq'},
    {input: 'I LOVE BBQ', expected: 'I Love Bbq'},
    {input: 'I Love Bbq', expected: 'I Love Bbq'},
    {input: null, expected: null},
  ])('titleCase: $input -> $expected', ({input, expected}) => {
    expect(titleCase(input)).toBe(expected);
  });

  test.each([
    {input: 'I Love BBQ', expected: 'I Love BBQ'},
    {input: 'i love bbq', expected: 'I love bbq'},
    {input: 'I LOVE BBQ', expected: 'I LOVE BBQ'},
    {input: null, expected: null},
  ])('sentenceCase: $input -> $expected', ({input, expected}) => {
    expect(sentenceCase(input)).toBe(expected);
  });
});
