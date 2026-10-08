/**
 * Converts a string to title case, e.g.
 * - I LOVE BBQ -> I Love Bbq
 * - i love bbq -> I Love Bbq
 */
export function titleCase(str: string | null) {
  if (str === null) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Converts the first letter of a string to uppercase
 */
export function sentenceCase(str: string | null) {
  if (str === null) return str;
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}
