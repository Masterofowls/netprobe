import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const APP_URL = "https://netprobe.expo.app";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>NetProbe — Network Connectivity Monitor</title>
        <meta
          name="description"
          content="Monitor websites and online services in real time. Check latency, DNS, TLS certificates, and availability from your network."
        />
        <meta name="theme-color" content="#1a1a2e" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="NetProbe" />
        <meta
          property="og:description"
          content="Real-time network resource connectivity monitor for Android and web."
        />
        <meta property="og:url" content={APP_URL} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="NetProbe" />
        <meta
          name="twitter:description"
          content="Monitor websites and services with latency, DNS, and TLS checks."
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="canonical" href={APP_URL} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
