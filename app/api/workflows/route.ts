import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(workflows);
  } catch (err) {
    console.error("Failed to fetch workflows:", err);
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, nodes, edges } = body;

    if (!name || !nodes || !edges) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description: description || null,
        nodes: nodes as any,
        edges: edges as any,
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (err) {
    console.error("Failed to create workflow:", err);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}
