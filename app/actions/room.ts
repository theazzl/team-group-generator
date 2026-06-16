"use server"

import { randomBytes, randomInt } from "node:crypto"
import { and, asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { participants, rooms, type Participant, type Room } from "@/lib/db/schema"

function generateRoomCode() {
  // Avoid ambiguous characters (0/O, 1/I) for easy verbal sharing.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(6)
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length]
  }
  return code
}

export type RoomState = {
  room: Room
  participants: Participant[]
}

export async function createRoom(input: {
  title: string
  names: string[]
  groupSize: number
}): Promise<{ code: string }> {
  const cleanNames = input.names.map((n) => n.trim()).filter((n) => n.length > 0)
  if (cleanNames.length < 2) {
    throw new Error("Please add at least 2 names.")
  }
  const groupSize = Math.max(1, Math.floor(input.groupSize))
  const title = input.title.trim() || "Team Shuffle"

  // Generate a unique room code.
  let code = generateRoomCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.select({ code: rooms.code }).from(rooms).where(eq(rooms.code, code))
    if (existing.length === 0) break
    code = generateRoomCode()
  }

  await db.insert(rooms).values({ code, title, groupSize, status: "open" })
  await db.insert(participants).values(
    cleanNames.map((name) => ({ roomCode: code, name })),
  )

  return { code }
}

export async function getRoomState(code: string): Promise<RoomState | null> {
  const roomRows = await db.select().from(rooms).where(eq(rooms.code, code))
  if (roomRows.length === 0) return null
  const list = await db
    .select()
    .from(participants)
    .where(eq(participants.roomCode, code))
    .orderBy(asc(participants.id))
  return { room: roomRows[0], participants: list }
}

export async function claimName(code: string, participantId: number): Promise<void> {
  await db
    .update(participants)
    .set({ claimed: true })
    .where(and(eq(participants.id, participantId), eq(participants.roomCode, code)))
}

export async function releaseName(code: string, participantId: number): Promise<void> {
  await db
    .update(participants)
    .set({ claimed: false })
    .where(and(eq(participants.id, participantId), eq(participants.roomCode, code)))
}

/**
 * Uniform Fisher-Yates shuffle using crypto-grade randomness.
 * Each of the n! orderings is equally likely.
 */
function fisherYates<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1) // 0 <= j <= i, unbiased
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function shuffleGroups(code: string): Promise<void> {
  const roomRows = await db.select().from(rooms).where(eq(rooms.code, code))
  if (roomRows.length === 0) throw new Error("Room not found.")
  const room = roomRows[0]

  const list = await db
    .select()
    .from(participants)
    .where(eq(participants.roomCode, code))
    .orderBy(asc(participants.id))

  if (list.length === 0) return

  const shuffled = fisherYates(list)
  const groupSize = Math.max(1, room.groupSize)

  // Assign sequentially into groups of `groupSize`.
  // When count % groupSize != 0, the last group simply has fewer members.
  for (let index = 0; index < shuffled.length; index++) {
    const groupNumber = Math.floor(index / groupSize) + 1
    await db
      .update(participants)
      .set({ groupNumber })
      .where(eq(participants.id, shuffled[index].id))
  }

  await db
    .update(rooms)
    .set({ status: "shuffled", shuffleSeq: room.shuffleSeq + 1 })
    .where(eq(rooms.code, code))
}

export async function resetShuffle(code: string): Promise<void> {
  await db.update(participants).set({ groupNumber: null }).where(eq(participants.roomCode, code))
  await db.update(rooms).set({ status: "open" }).where(eq(rooms.code, code))
}
