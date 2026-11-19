export type InstallPlatform = 'ios' | 'android' | 'in-app' | 'desktop';

interface InstallPlatformInput {
  userAgent: string;
  maxTouchPoints: number;
}

/**
 * Works out which install instructions apply to a browser.
 *
 * iPadOS Safari reports itself as a Mac by default, so a Mac with a touchscreen
 * counts as iOS. The touch check only applies to Macs, otherwise touchscreen
 * Windows laptops would count as tablets.
 */
export function getInstallPlatform({
  userAgent,
  maxTouchPoints,
}: InstallPlatformInput): InstallPlatform {
  const isIos =
    /iPhone|iPad|iPod/.test(userAgent) ||
    (userAgent.includes('Macintosh') && maxTouchPoints > 1);

  if (isIos) {
    // in-app browsers (e.g. Instagram, Facebook) leave out the Safari token
    return userAgent.includes('Safari/') ? 'ios' : 'in-app';
  }

  if (userAgent.includes('Android')) {
    return userAgent.includes('; wv)') ? 'in-app' : 'android';
  }

  return 'desktop';
}
