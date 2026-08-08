import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const upstream = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/quiz`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "X-API-Key": process.env.QUIZ_API_KEY!,
        },
        body: JSON.stringify(body),
      }
    );

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

  } catch (error: any) {
    console.error("Quiz Proxy Error:", error);

    return NextResponse.json(
      { detail: "Internal proxy error" },
      { status: 500 }
    );
  }
}
