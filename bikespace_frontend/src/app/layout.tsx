import React from 'react';
import Head from 'next/head';
import Script from 'next/script';

import type {Metadata} from 'next';

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
          src="https://us.umami.is/script.js"
          data-website-id="77b33a3d-0b83-41f2-9b54-589d36903aed"
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
