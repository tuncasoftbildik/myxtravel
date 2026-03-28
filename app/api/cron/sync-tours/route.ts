import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call enriched-list endpoint to warm the cache
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/a2tours/enriched-list`, {
      method: "GET",
      headers: { "Cache-Control": "no-cache" },
    });

    const data = await res.json();

    return NextResponse.json({
      success: true,
      message: "Tour cache warmed",
      tourCount: data.count || 0,
      cached: data.cached || false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cache warm failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
