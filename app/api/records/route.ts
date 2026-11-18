import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SalesRecord, UserSession } from "@/types/analytics";

function getSessionRole(request: NextRequest): string {
  const raw = request.cookies.get("aurabi_session")?.value;
  if (!raw) return "OWNER";
  try {
    const parsed = JSON.parse(raw) as UserSession;
    return parsed.role || "VIEWER";
  } catch {
    return "VIEWER";
  }
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      connected: false,
      records: [],
    });
  }

  try {
    const rows = await prisma.saleTransaction.findMany({
      orderBy: { date: "desc" },
    });

    const records: SalesRecord[] = rows.map((r) => ({
      id: r.id,
      date: r.date,
      product: r.product,
      category: r.category,
      store: r.store,
      revenue: r.revenue,
      cost: r.cost,
      profit: r.profit,
    }));

    return NextResponse.json({
      connected: true,
      records,
    });
  } catch {
    return NextResponse.json({
      connected: false,
      records: [],
    });
  }
}

export async function POST(request: NextRequest) {
  const role = getSessionRole(request);
  if (role === "VIEWER") {
    return NextResponse.json(
      { error: "Forbidden: Viewers cannot import or modify records." },
      { status: 403 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      connected: false,
      persisted: false,
    });
  }

  try {
    const body = await request.json();
    const incoming = Array.isArray(body.records)
      ? (body.records as SalesRecord[])
      : [];

    if (incoming.length === 0) {
      return NextResponse.json(
        { error: "No records provided." },
        { status: 400 }
      );
    }

    await prisma.saleTransaction.createMany({
      data: incoming.map((r) => ({
        date: r.date,
        product: r.product,
        category: r.category,
        store: r.store || "Primary Store",
        revenue: r.revenue,
        cost: r.cost,
        profit: r.profit,
        source: "CSV_EXCEL_IMPORT",
      })),
    });

    return NextResponse.json({
      connected: true,
      persisted: true,
      insertedCount: incoming.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Database write failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const role = getSessionRole(request);
  if (role !== "OWNER") {
    return NextResponse.json(
      { error: "Forbidden: Only Workspace Owners can purge database records." },
      { status: 403 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ connected: false, deleted: false });
  }

  try {
    await prisma.saleTransaction.deleteMany({});
    return NextResponse.json({ connected: true, deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to clear database records." },
      { status: 500 }
    );
  }
}