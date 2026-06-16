import { NextResponse } from "next/server"
import { getRoomState } from "@/app/actions/room"

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const state = await getRoomState(code.toUpperCase())
  if (!state) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }
  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store" },
  })
}
