import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tuition Serve",
    short_name: "Tuition Serve",
    description: "Admin-mediated home tuition matching.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0A4D8C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
