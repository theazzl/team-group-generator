"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Shuffle, Users } from "lucide-react"
import { createRoom } from "@/app/actions/room"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function CreateRoomForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [namesText, setNamesText] = useState("")
  const [groupSize, setGroupSize] = useState(4)

  const names = namesText
    .split(/[\n,]/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0)

  const count = names.length
  const fullGroups = groupSize > 0 ? Math.floor(count / groupSize) : 0
  const remainder = groupSize > 0 ? count % groupSize : 0
  const totalGroups = fullGroups + (remainder > 0 ? 1 : 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (count < 2) {
      toast.error("Add at least 2 names.")
      return
    }
    if (groupSize < 1) {
      toast.error("Group size must be at least 1.")
      return
    }
    startTransition(async () => {
      try {
        const { code } = await createRoom({ title, names, groupSize })
        router.push(`/room/${code}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Room name</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Friday Game Night"
          maxLength={60}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="names">
          Names <span className="text-muted-foreground font-normal">(one per line)</span>
        </Label>
        <textarea
          id="names"
          value={namesText}
          onChange={(e) => setNamesText(e.target.value)}
          placeholder={"Alex\nJordan\nSam\nTaylor\nMorgan"}
          rows={7}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 min-h-32 w-full resize-y rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none"
        />
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Users className="size-3.5" />
          {count} {count === 1 ? "person" : "people"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="groupSize">People per group</Label>
        <div className="flex items-center gap-3">
          <Input
            id="groupSize"
            type="number"
            min={1}
            max={50}
            value={groupSize}
            onChange={(e) => setGroupSize(Number.parseInt(e.target.value) || 0)}
            className="w-24"
          />
          {count >= 2 && groupSize >= 1 && (
            <span className="text-muted-foreground text-sm text-pretty">
              {totalGroups} {totalGroups === 1 ? "group" : "groups"}
              {remainder > 0 ? ` (last group has ${remainder})` : ""}
            </span>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="mt-1 gap-2">
        <Shuffle className="size-4" />
        {isPending ? "Creating..." : "Create room"}
      </Button>
    </form>
  )
}
