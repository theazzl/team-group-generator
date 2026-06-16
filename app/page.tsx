import { Shuffle, Users, Link2, Sparkles } from "lucide-react"
import { CreateRoomForm } from "@/components/create-room-form"
import { JoinRoom } from "@/components/join-room"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col px-5 py-10 md:py-16">
      <header className="flex items-center gap-2">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl">
          <Shuffle className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Shuffle</span>
      </header>

      <div className="mt-10 grid flex-1 items-start gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
        <section className="flex flex-col gap-6">
          <div className="bg-accent/10 text-accent inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" />
            No sign-up needed
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
            Random teams in seconds.
          </h1>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed text-pretty">
            Drop in a list of names, share the link, and let everyone pick their own name. One tap
            shuffles everyone into fair, evenly random groups.
          </p>

          <ul className="mt-2 flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <span className="bg-secondary text-secondary-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Users className="size-4" />
              </span>
              <div>
                <p className="font-medium">Everyone joins themselves</p>
                <p className="text-muted-foreground text-sm text-pretty">
                  Share one link. People open it and tap their own name.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-secondary text-secondary-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Shuffle className="size-4" />
              </span>
              <div>
                <p className="font-medium">Uniformly random</p>
                <p className="text-muted-foreground text-sm text-pretty">
                  A true Fisher-Yates shuffle. The last group can have fewer people when it
                  doesn&apos;t divide evenly.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-secondary text-secondary-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Link2 className="size-4" />
              </span>
              <div>
                <p className="font-medium">Live for everyone</p>
                <p className="text-muted-foreground text-sm text-pretty">
                  Results appear instantly for every person in the room.
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-2">
            <p className="text-muted-foreground mb-2 text-sm font-medium">Already have a code?</p>
            <div className="max-w-xs">
              <JoinRoom />
            </div>
          </div>
        </section>

        <section className="bg-card border-border rounded-2xl border p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Create a room</h2>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Set it up once, then share the link.
          </p>
          <CreateRoomForm />
        </section>
      </div>
    </main>
  )
}
