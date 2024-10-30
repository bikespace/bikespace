import React from 'react';
import Script from 'next/script';

import type {Metadata, Viewport} from 'next';

import {umamiConfig} from '@/config/umami';

import '@/styles/global.scss';

export const metadata: Metadata = {
  title: 'BikeSpace',
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
        <meta name="apple-mobile-web-app-title" content="Bikespace" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>{children}</body>
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
