import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers/providers";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "BLOKK LENS — Real-time Cryptocurrency Tracking",
  description: "Track real-time cryptocurrency prices, market caps, and trends. Save your favorite coins and stay updated.",
  icons: {
    icon: [
      { url: '/blokklensDark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/blokklensLight.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
    ],
    shortcut: '/blokklensLight.svg',
    apple: '/blokklensLight.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('blokk-lens-theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
