import { NextResponse } from "next/server";
import { buildAdsTxtContent } from "@/lib/ads";

export const dynamic = "force-dynamic";

export function GET() {
  const content = buildAdsTxtContent();
  if (!content) {
    return new NextResponse(
      "# Google AdSense is not configured yet. Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in environment variables.\n",
      {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
