"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  datetime: string
}

const leagues = [
  "Série A",
  "Série B",
  "Copa do Brasil",
  "Libertadores",
  "Sul-Americana",
  "Copa do Nordeste",
]

const championships = [
  { id: "1", name: "Brasileirão 2025" },
  { id: "2", name: "Copa do Brasil 2025" },
  { id: "3", name: "Libertadores 2025" },
]

const emptyMatch: () => Match = () => ({
  id: crypto.randomUUID(),
  homeTeam: "",
  awayTeam: "",
  league: "Série A",
  datetime: "",
})

export default function NewRoundPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roundNumber, setRoundNumber] = useState("")
  const [championship, setChampionship] = useState("")
  const [deadline, setDeadline] = useState("")
  const [matches, setMatches] = useState<Match[]>(
    Array.from({ length: 14 }, emptyMatch)
  )

  const updateMatch = (index: number, field: keyof Match, value: string) => {
    setMatches((prev) =>
      prev.map((match, i) =>
        i === index ? { ...match, [field]: value } : match
      )
    )
  }

  const addMatch = () => {
    if (matches.length >= 14) {
      toast.error("Maximum of 14 matches per round")
      return
    }
    setMatches((prev) => [...prev, emptyMatch()])
  }

  const removeMatch = (index: number) => {
    if (matches.length <= 1) {
      toast.error("The round must have at least 1 match")
      return
    }
    setMatches((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (asDraft: boolean) => {
    if (!roundNumber || !championship || !deadline) {
      toast.error("Please fill in all required fields")
      return
    }

    const validMatches = matches.filter(
      (m) => m.homeTeam && m.awayTeam && m.datetime
    )

    if (validMatches.length < 1) {
      toast.error("Add at least 1 complete match")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success(
      asDraft
        ? "Round saved as draft"
        : "Round published successfully"
    )

    router.push("/admin/rounds")
  }

  const completedMatches = matches.filter(
    (m) => m.homeTeam && m.awayTeam && m.datetime
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/rounds">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Round</h1>
          <p className="text-muted-foreground">Configure a new Loteca round</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General round details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="roundNumber">Round Number *</Label>
                  <Input
                    id="roundNumber"
                    type="number"
                    placeholder="e.g. 1017"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="championship">Championship *</Label>
                  <Select value={championship} onValueChange={setChampionship}>
                    <SelectTrigger id="championship">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {championships.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Bet Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  After this time, bets can no longer be submitted
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Matches */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Matches</CardTitle>
                  <CardDescription>
                    Configure the 14 round matches
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {completedMatches}/14 complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-end"
                >
                  <div className="flex items-center gap-2 text-muted-foreground sm:hidden">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm">Match {index + 1}</span>
                  </div>

                  <div className="hidden sm:flex sm:items-center sm:gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>

                  <div className="grid flex-1 gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Home Team</Label>
                      <Input
                        placeholder="e.g. Flamengo"
                        value={match.homeTeam}
                        onChange={(e) => updateMatch(index, "homeTeam", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Away Team</Label>
                      <Input
                        placeholder="e.g. Palmeiras"
                        value={match.awayTeam}
                        onChange={(e) => updateMatch(index, "awayTeam", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Competition</Label>
                      <Select
                        value={match.league}
                        onValueChange={(v) => updateMatch(index, "league", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {leagues.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date/Time</Label>
                      <Input
                        type="datetime-local"
                        value={match.datetime}
                        onChange={(e) => updateMatch(index, "datetime", e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="self-end text-muted-foreground hover:text-destructive"
                    onClick={() => removeMatch(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {matches.length < 14 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addMatch}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Match ({matches.length}/14)
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                <Eye className="mr-2 h-4 w-4" />
                Publish Round
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Round</span>
                <span className="font-medium">{roundNumber || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matches</span>
                <span className="font-medium">{completedMatches}/14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadline</span>
                <span className="font-medium">
                  {deadline
                    ? new Date(deadline).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
