import React from 'react';
import Script from 'next/script';

import type {Metadata, Viewport} from 'next';

import {umamiConfig} from '@/config/umami';

import '@/styles/global.scss';
import {ServiceWorkerRegistration} from '@/components/service-worker/ServiceWorkerRegistration';

const siteTitle = 'BikeSpace';
const siteDescription = 'Digital tools to improve bicycle parking in Toronto';

export const metadata: Metadata = {
  metadataBase: new URL('https://bikespace.ca'),

  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    locale: 'en_CA',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#136329',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="BikeSpace" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
      {
        // Disable tracking during development
        process.env.NODE_ENV === 'development' ? null : (
          <Script
            async
            src={umamiConfig.hostUrl}
            data-website-id={umamiConfig.websiteId}
          />
        )
      }
    </html>
  );
}
