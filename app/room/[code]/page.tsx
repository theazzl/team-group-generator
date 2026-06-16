import Link from "next/link"
import { notFound } from "next/navigation"
import { Shuffle } from "lucide-react"
import { getRoomState } from "@/app/actions/room"
import { RoomClient } from "@/components/room-client"

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const upper = code.toUpperCase()
  const initialState = await getRoomState(upper)
  if (!initialState) notFound()

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col px-5 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Shuffle className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Shuffle</span>
        </Link>
      </header>
      <RoomClient code={upper} initialState={initialState} />
    </main>
  )
}
