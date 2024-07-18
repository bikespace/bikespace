import React from 'react';
import type { Metadata } from "next";

import "@/assets/styles/global.scss";

export const metadata: Metadata = {
  title: "BikeSpace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
