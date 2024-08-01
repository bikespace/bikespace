import React from 'react';
import Head from 'next/head';
import Script from 'next/script';

import type {Metadata} from 'next';

import {umamiConfig} from '@/config/umami';

import '@/styles/global.scss';

export const metadata: Metadata = {
  title: 'BikeSpace',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <Script
          async
          src={umamiConfig.hostUrl}
          data-website-id={umamiConfig.websiteId}
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
