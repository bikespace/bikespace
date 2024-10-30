import type {MetadataRoute} from 'next';
import bikespaceLogoSm from '../assets/icons/bikespace_logo_sm.svg';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bikespace',
    short_name: 'Bikespace',
    description: "Bikespace - Toronto's Bike Parking App",
    start_url: '/',
    display: 'standalone',
    icons: [
      {
        src: bikespaceLogoSm,
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
