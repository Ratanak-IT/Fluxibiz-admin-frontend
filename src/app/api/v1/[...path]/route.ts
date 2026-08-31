import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const REQUEST_HEADER_ALLOWLIST = ["authorization", "content-type", "accept", "accept-language"];
const RESPONSE_HEADER_ALLOWLIST = ["content-type", "content-disposition", "cache-control"];

async function forward(request: NextRequest, path: string[]) {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: "Backend API URL is not configured." }, { status: 500 });
  }

  const targetUrl = `${BACKEND_URL}/api/v1/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of REQUEST_HEADER_ALLOWLIST) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
    cache: "no-store",
  };
  if (hasBody) init.duplex = "half";

  let response: Response;
  try {
    response = await fetch(targetUrl, init);
  } catch {
    return NextResponse.json({ message: "Unable to reach the backend service." }, { status: 502 });
  }

  const responseHeaders = new Headers();
  for (const name of RESPONSE_HEADER_ALLOWLIST) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return forward(request, path);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return forward(request, path);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return forward(request, path);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return forward(request, path);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return forward(request, path);
}

export async function HEAD(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return forward(request, path);
}
