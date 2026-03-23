import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "GET");
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "PUT");
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "DELETE");
}

async function handleProxy(
  request: NextRequest,
  pathSegments: string[],
  method: string
): Promise<NextResponse> {
  const subKeyValue = request.headers.get("x-api-key");

  if (!subKeyValue) {
    return NextResponse.json(
      { error: "Missing x-api-key header" },
      { status: 401 }
    );
  }

  const subKey = await prisma.subKey.findUnique({
    where: { key: subKeyValue },
    include: { pass: true },
  });

  if (!subKey || !subKey.isActive) {
    return NextResponse.json(
      { error: "Invalid or inactive sub-key" },
      { status: 401 }
    );
  }

  if (!subKey.pass.isActive) {
    return NextResponse.json(
      { error: "Associated pass has been revoked" },
      { status: 403 }
    );
  }

  const targetBaseUrl = process.env.PROXY_TARGET_BASE_URL;
  if (!targetBaseUrl) {
    return NextResponse.json(
      { error: "Proxy target not configured" },
      { status: 503 }
    );
  }

  const targetPath = "/" + pathSegments.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${targetBaseUrl}${targetPath}${searchParams ? `?${searchParams}` : ""}`;

  const forwardHeaders = new Headers();

  request.headers.forEach((value, key) => {
    const skip = [
      "x-api-key",
      "host",
      "connection",
      "x-vault-role",
      "x-vault-pass-id",
    ];
    if (!skip.includes(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const masterKey = process.env.MASTER_API_KEY;
  const masterKeyHeader = process.env.MASTER_API_KEY_HEADER ?? "Authorization";
  const masterKeyPrefix = process.env.MASTER_API_KEY_PREFIX ?? "Bearer ";

  if (masterKey) {
    forwardHeaders.set(masterKeyHeader, `${masterKeyPrefix}${masterKey}`);
  }

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await request.text();
    } else if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = await request.arrayBuffer();
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const skip = ["connection", "transfer-encoding", "keep-alive"];
      if (!skip.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await upstream.arrayBuffer();

    return new NextResponse(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[PROXY_ERROR]", error);
    return NextResponse.json(
      { error: "Upstream request failed" },
      { status: 502 }
    );
  }
}
