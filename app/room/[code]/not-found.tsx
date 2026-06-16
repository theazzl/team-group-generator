import Link from "next/link"
import { SearchX } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function RoomNotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-14 items-center justify-center rounded-2xl">
        <SearchX className="size-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Room not found</h1>
      <p className="text-muted-foreground text-pretty">
        That room code doesn&apos;t exist. Double-check the code or create a new room.
      </p>
      <Link href="/" className={buttonVariants({ size: "lg", className: "mt-2" })}>
        Create a room
      </Link>
    </main>
  )
}
