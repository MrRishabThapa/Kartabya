import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookie = req.headers.get("cookie");

    const upstream = await apiFetch("/v1/quiz", {
      method: "POST",
      headers: cookie ? { Cookie: cookie } : undefined,
      body: JSON.stringify(body),
    });

    const text = await upstream.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { detail: "Upstream returned invalid JSON", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: upstream.status });

  } catch (error: unknown) {
    console.error("Quiz Proxy Error:", error);

    return NextResponse.json(
      { detail: "Internal proxy error" },
      { status: 500 }
    );
  }
}
