import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bikespace',
    short_name: 'Bikespace',
    description: "Bikespace - Toronto's Bike Parking App",
    start_url: '/',
    display: 'standalone',
    icons: [
      {
        src: '/icons/bikespace_logo_sm.svg',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
