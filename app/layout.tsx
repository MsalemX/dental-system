import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "جُمان | عيادات طب الأسنان التخصصية",
  description: "عيادة جُمان لطب الأسنان، حيث تجتمع الخبرة مع أحدث التقنيات لابتسامة مثالية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="font-cairo min-h-full flex flex-col">{children}</body>
    </html>
  );
}

