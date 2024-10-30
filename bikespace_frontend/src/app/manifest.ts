import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bikespace',
    short_name: 'Bikespace',
    description: "Bikespace - Toronto's Bike Parking App",
    start_url: '/',
    display: 'standalone',
    background_color: '#25c252',
    icons: [
      {
        src: '/bikespace_logo_sm.svg',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
