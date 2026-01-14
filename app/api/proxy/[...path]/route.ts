import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = "https://wallet-service-app-s656.onrender.com/api/v1"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "GET")
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "POST")
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "PUT")
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "DELETE")
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "PATCH")
}

async function proxyRequest(request: NextRequest, path: string[], method: string) {
  try {
    const pathString = path.join("/")
    const url = `${BACKEND_URL}/${pathString}`

    // Get search params from the original request
    const searchParams = request.nextUrl.searchParams.toString()
    const fullUrl = searchParams ? `${url}?${searchParams}` : url

    console.log("[v0] Proxying request:", {
      method,
      path: pathString,
      fullUrl,
    })

    // Get body if it exists
    let body = null
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await request.json()
      } catch (e) {
        // No body or invalid JSON
      }
    }

    // Forward headers from the original request
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Forward authorization header if present
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Make the request to the backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    })

    const data = await response.json()

    console.log("[v0] Backend response:", {
      status: response.status,
      ok: response.ok,
    })

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
