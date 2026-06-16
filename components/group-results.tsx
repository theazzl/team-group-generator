import type { Participant } from "@/lib/db/schema"
import { Card } from "@/components/ui/card"

const ACCENTS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function GroupResults({
  participants,
  groupSize,
}: {
  participants: Participant[]
  groupSize: number
}) {
  // Bucket participants by their assigned group number.
  const groups = new Map<number, Participant[]>()
  for (const p of participants) {
    if (p.groupNumber == null) continue
    const list = groups.get(p.groupNumber) ?? []
    list.push(p)
    groups.set(p.groupNumber, list)
  }
  const sorted = [...groups.entries()].sort((a, b) => a[0] - b[0])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sorted.map(([groupNumber, members], i) => {
        const accent = ACCENTS[i % ACCENTS.length]
        const isPartial = members.length < groupSize
        return (
          <Card key={groupNumber} className="overflow-hidden p-0">
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ backgroundColor: accent }}
            >
              <h3 className="font-semibold text-white">Group {groupNumber}</h3>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                {members.length} {members.length === 1 ? "person" : "people"}
                {isPartial ? " · partial" : ""}
              </span>
            </div>
            <ul className="flex flex-col divide-y">
              {members.map((m) => (
                <li key={m.id} className="px-5 py-2.5 text-sm font-medium">
                  {m.name}
                </li>
              ))}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}
