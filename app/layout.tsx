import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArcPay",
  description: "Professional Web3 payment app on Arc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}