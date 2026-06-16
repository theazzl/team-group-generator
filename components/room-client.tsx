"use client"

import { useState, useTransition } from "react"
import useSWR from "swr"
import { Check, Copy, RotateCcw, Share2, Shuffle, Users } from "lucide-react"
import { claimName, releaseName, resetShuffle, shuffleGroups, type RoomState } from "@/app/actions/room"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { GroupResults } from "@/components/group-results"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CLAIM_KEY = (code: string) => `shuffle-claim-${code}`

export function RoomClient({ code, initialState }: { code: string; initialState: RoomState }) {
  const { data, mutate } = useSWR<RoomState>(`/api/room/${code}`, fetcher, {
    fallbackData: initialState,
    refreshInterval: 2500,
    revalidateOnFocus: true,
  })
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const state = data ?? initialState
  const { room, participants } = state

  // Track which name this device claimed (so users can release/switch).
  const [myId, setMyId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null
    const stored = window.localStorage.getItem(CLAIM_KEY(code))
    return stored ? Number.parseInt(stored) : null
  })

  const claimedCount = participants.filter((p) => p.claimed).length
  const isShuffled = room.status === "shuffled"

  function persistMyId(id: number | null) {
    setMyId(id)
    if (typeof window === "undefined") return
    if (id === null) window.localStorage.removeItem(CLAIM_KEY(code))
    else window.localStorage.setItem(CLAIM_KEY(code), String(id))
  }

  function handlePick(id: number, alreadyClaimed: boolean) {
    if (isShuffled) return
    if (alreadyClaimed && id !== myId) {
      toast.error("That name is already taken.")
      return
    }
    startTransition(async () => {
      // Release previous selection on this device.
      if (myId !== null && myId !== id) {
        await releaseName(code, myId)
      }
      if (id === myId) {
        await releaseName(code, id)
        persistMyId(null)
      } else {
        await claimName(code, id)
        persistMyId(id)
      }
      mutate()
    })
  }

  async function handleShare() {
    const url = `${window.location.origin}/room/${code}`
    const shareData = { title: room.title, text: `Join "${room.title}" on Shuffle`, url }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // fall through to copy
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShuffle() {
    startTransition(async () => {
      try {
        await shuffleGroups(code)
        await mutate()
        toast.success("Shuffled!")
      } catch {
        toast.error("Could not shuffle.")
      }
    })
  }

  function handleReset() {
    startTransition(async () => {
      await resetShuffle(code)
      await mutate()
    })
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">{room.title}</h1>
          <div className="text-muted-foreground mt-2 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              {participants.length} people
            </span>
            <span aria-hidden>•</span>
            <span>{room.groupSize} per group</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-sm tracking-widest">
            {code}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
            Share
          </Button>
        </div>
      </div>

      {!isShuffled ? (
        <>
          <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Pick your name</h2>
              <span className="text-muted-foreground text-sm">
                {claimedCount}/{participants.length} ready
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {participants.map((p) => {
                const mine = p.id === myId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePick(p.id, p.claimed)}
                    disabled={isPending || (p.claimed && !mine)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      mine
                        ? "border-primary bg-primary text-primary-foreground"
                        : p.claimed
                          ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                          : "border-border bg-background hover:border-primary/50 hover:bg-secondary",
                    )}
                  >
                    <span className="truncate">{p.name}</span>
                    {mine ? (
                      <Check className="size-4 shrink-0" />
                    ) : p.claimed ? (
                      <Check className="size-4 shrink-0 opacity-40" />
                    ) : null}
                  </button>
                )
              })}
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Tap your name to claim it. Tap again to release.
            </p>
          </div>

          <Button size="lg" onClick={handleShuffle} disabled={isPending} className="gap-2">
            <Shuffle className="size-4" />
            Shuffle into groups
          </Button>
        </>
      ) : (
        <>
          <GroupResults participants={participants} groupSize={room.groupSize} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="lg" onClick={handleShuffle} disabled={isPending} className="flex-1 gap-2">
              <Shuffle className="size-4" />
              Shuffle again
            </Button>
            <Button variant="ghost" size="lg" onClick={handleReset} disabled={isPending} className="gap-2">
              <RotateCcw className="size-4" />
              Back to picking
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
