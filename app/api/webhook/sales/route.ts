import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SalesRecord } from "@/types/analytics";

const DEMO_API_KEY = process.env.WEBHOOK_API_KEY || "aura_live_sk_987654321";
const liveWebhookOrders: SalesRecord[] = [];

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== DEMO_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing x-api-key header" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    count: liveWebhookOrders.length,
    records: liveWebhookOrders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== DEMO_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing x-api-key header" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const product = String(body.product ?? "").trim();
    const category = String(body.category ?? "General").trim() || "General";
    const store =
      String(body.store ?? "Online E-Commerce").trim() || "Online E-Commerce";
    const revenue = Number(body.revenue);
    const cost = Number(body.cost ?? 0);
    const date =
      String(body.date ?? "").trim() || new Date().toISOString().split("T")[0];

    if (!product || isNaN(revenue) || revenue <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Validation Error: 'product' (string) and positive 'revenue' (number) are required.",
        },
        { status: 400 }
      );
    }

    const safeCost = isNaN(cost) || cost < 0 ? 0 : cost;
    const profit = revenue - safeCost;

    let savedId = `wh-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let persistedToDb = false;

    if (isDatabaseConfigured()) {
      const created = await prisma.saleTransaction.create({
        data: {
          date,
          product,
          category,
          store,
          revenue,
          cost: safeCost,
          profit,
          source: "WEBHOOK_API",
        },
      });
      savedId = created.id;
      persistedToDb = true;
    }

    const newRecord: SalesRecord = {
      id: savedId,
      date,
      product,
      category,
      store,
      revenue,
      cost: safeCost,
      profit,
    };

    liveWebhookOrders.unshift(newRecord);

    return NextResponse.json(
      {
        success: true,
        persistedToDb,
        message: "Order ingested into real-time analytics pipeline",
        record: newRecord,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}