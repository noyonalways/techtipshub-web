import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { fontDisplay, fontSans } from "@/config/fonts";
import { Providers } from "../providers";
import { siteConfig } from "@/config/site";
import { siteOrigin } from "@/lib/seo";
import AdSense from "@/components/adsense";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";

/**
 * Every crawlable identity asset lives in `/brand`. The metadata below is the
 * only place that names them, so swapping the brand once means editing one
 * block: og image, icons, manifest, theme colour.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "TechTipsHub: practical writing for people who build software",
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/brand/favicon.ico",
  },
  manifest: "/brand/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    url: "/",
    title: "TechTipsHub: practical writing for people who build software",
    description: siteConfig.description,
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}, ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechTipsHub: practical writing for people who build software",
    description: siteConfig.description,
    images: ["/brand/twitter-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFAF6" },
    { media: "(prefers-color-scheme: dark)", color: "#141315" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <AdSense pubId="ca-pub-6721594154492556" />
        <meta
          name="google-site-verification"
          content="jJtpLqOAtKxVMyWZ3fZTjPVLW8xexGIU7rV1Enr4cRI"
        />
      </head>
      <GoogleTagManager gtmId="G-M37M4689E8" />
      <GoogleAnalytics gaId="G-M37M4689E8" />
      <body
        className={clsx(
          "bg-background font-sans text-foreground antialiased",
          fontSans.variable,
          fontDisplay.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
