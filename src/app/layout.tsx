import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { PUBLIC_ENV } from "@/env/public";

const inter = Nunito({ subsets: ["latin"], variable: "--nunito" });

export const metadata: Metadata = {
  title: PUBLIC_ENV.CORP_NAME,
  description: PUBLIC_ENV.CORP_NAME,
};

export const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <html lang="en">
    <body className={inter.className}>{children}</body>
  </html>
);

export default RootLayout;
