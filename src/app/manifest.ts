import type { MetadataRoute } from "next";

// Placeholder "TS" mark on the brand color — swap public/icon-192.png and
// icon-512.png for real branding assets whenever the client supplies them.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tuition Serve",
    short_name: "Tuition Serve",
    description: "Admin-mediated home tuition matching.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#006c49",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
