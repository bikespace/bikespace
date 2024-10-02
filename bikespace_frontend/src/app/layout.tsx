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
      <body>{children}</body>
      <Script
        async
        src={umamiConfig.hostUrl}
        data-website-id={umamiConfig.websiteId}
      />
    </html>
  );
}
