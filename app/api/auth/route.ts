import { NextRequest, NextResponse } from "next/server";
import { UserRole, UserSession } from "@/types/analytics";

const COOKIE_NAME = "aurabi_session";

const DEFAULT_SESSION: UserSession = {
  name: "Yasirul Islam Imran",
  email: "imran@aurabi.io",
  role: "OWNER",
};

export async function GET(request: NextRequest) {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) {
    return NextResponse.json({ user: DEFAULT_SESSION });
  }

  try {
    const parsed = JSON.parse(raw) as UserSession;
    return NextResponse.json({ user: parsed });
  } catch {
    return NextResponse.json({ user: DEFAULT_SESSION });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const role = String(body.role ?? "OWNER").toUpperCase() as UserRole;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["OWNER", "ANALYST", "VIEWER"];
    const safeRole: UserRole = validRoles.includes(role) ? role : "VIEWER";

    const session: UserSession = { name, email, role: safeRole };
    const response = NextResponse.json({ success: true, user: session });

    response.cookies.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}