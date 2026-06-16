"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function JoinRoom() {
  const router = useRouter()
  const [code, setCode] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (clean.length === 0) return
    router.push(`/room/${clean}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter room code"
        className="font-mono tracking-widest uppercase"
        maxLength={6}
        aria-label="Room code"
      />
      <Button type="submit" variant="secondary" size="icon" aria-label="Join room">
        <ArrowRight className="size-4" />
      </Button>
    </form>
  )
}
