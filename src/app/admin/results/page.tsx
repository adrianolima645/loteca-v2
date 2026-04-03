"use client"

import { useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Result = "home" | "draw" | "away" | null

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  datetime: string
  result: Result
  homeScore: string
  awayScore: string
}

// Mock data
const pendingRounds = [
  {
    id: 1015,
    championship: "Brasileirão 2025",
    deadline: "2025-01-12T20:00:00",
    betsCount: 1124,
    matches: [
      { id: "1", homeTeam: "Flamengo", awayTeam: "Palmeiras", league: "Série A", datetime: "2025-01-12T16:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "2", homeTeam: "Corinthians", awayTeam: "São Paulo", league: "Série A", datetime: "2025-01-12T18:30:00", result: null, homeScore: "", awayScore: "" },
      { id: "3", homeTeam: "Grêmio", awayTeam: "Internacional", league: "Série A", datetime: "2025-01-12T16:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "4", homeTeam: "Atlético-MG", awayTeam: "Cruzeiro", league: "Série A", datetime: "2025-01-12T18:30:00", result: null, homeScore: "", awayScore: "" },
      { id: "5", homeTeam: "Fluminense", awayTeam: "Botafogo", league: "Série A", datetime: "2025-01-12T20:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "6", homeTeam: "Santos", awayTeam: "Bahia", league: "Série A", datetime: "2025-01-12T18:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "7", homeTeam: "Athletico-PR", awayTeam: "Coritiba", league: "Série A", datetime: "2025-01-12T16:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "8", homeTeam: "Fortaleza", awayTeam: "Ceará", league: "Série A", datetime: "2025-01-12T18:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "9", homeTeam: "Vasco", awayTeam: "Flamengo", league: "Copa do Brasil", datetime: "2025-01-13T21:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "10", homeTeam: "Palmeiras", awayTeam: "São Paulo", league: "Copa do Brasil", datetime: "2025-01-13T19:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "11", homeTeam: "Sport", awayTeam: "Santa Cruz", league: "Série B", datetime: "2025-01-12T16:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "12", homeTeam: "Avaí", awayTeam: "Chapecoense", league: "Série B", datetime: "2025-01-12T18:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "13", homeTeam: "Goiás", awayTeam: "Vila Nova", league: "Série B", datetime: "2025-01-12T20:00:00", result: null, homeScore: "", awayScore: "" },
      { id: "14", homeTeam: "Criciúma", awayTeam: "Figueirense", league: "Série B", datetime: "2025-01-12T16:00:00", result: null, homeScore: "", awayScore: "" },
    ] as Match[],
  },
]

const resultOptions = [
  { value: "home", label: "Home" },
  { value: "draw", label: "Draw" },
  { value: "away", label: "Away" },
]

export default function ResultsPage() {
  const [rounds, setRounds] = useState(pendingRounds)
  const [expandedRound, setExpandedRound] = useState<number | null>(1015)
  const [isPublishing, setIsPublishing] = useState(false)

  const updateMatchResult = (roundId: number, matchId: string, result: Result) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id === roundId
          ? {
              ...round,
              matches: round.matches.map((match) =>
                match.id === matchId ? { ...match, result } : match
              ),
            }
          : round
      )
    )
  }

  const publishResults = async (roundId: number) => {
    const round = rounds.find((r) => r.id === roundId)
    if (!round) return

    const incompleteMatches = round.matches.filter((m) => !m.result)
    if (incompleteMatches.length > 0) {
      toast.error(`${incompleteMatches.length} match(es) without a result set`)
      return
    }

    setIsPublishing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success("Results published and scores calculated!")
    setRounds((prev) => prev.filter((r) => r.id !== roundId))
    setIsPublishing(false)
  }

  const getCompletionStatus = (matches: Match[]) => {
    const completed = matches.filter((m) => m.result).length
    return { completed, total: matches.length }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publish Results</h1>
        <p className="text-muted-foreground">
          Enter match results to calculate scores
        </p>
      </div>

      {rounds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="mt-4 text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground">
              No rounds awaiting results publication
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rounds.map((round) => {
            const { completed, total } = getCompletionStatus(round.matches)
            const isComplete = completed === total

            return (
              <Collapsible
                key={round.id}
                open={expandedRound === round.id}
                onOpenChange={(open) => setExpandedRound(open ? round.id : null)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent font-mono text-lg font-bold">
                            {round.id}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Round {round.id}
                            </CardTitle>
                            <CardDescription>
                              {round.championship} &bull; {round.betsCount} bets
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={isComplete ? "default" : "secondary"}>
                            {completed}/{total} results
                          </Badge>
                          <ChevronDown className={cn(
                            "h-5 w-5 text-muted-foreground transition-transform",
                            expandedRound === round.id && "rotate-180"
                          )} />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {/* Alert */}
                      <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground">
                            Set the result for each match
                          </p>
                          <p className="text-muted-foreground">
                            When published, scores will be calculated automatically
                          </p>
                        </div>
                      </div>

                      {/* Matches */}
                      <div className="space-y-2">
                        {round.matches.map((match, index) => (
                          <div
                            key={match.id}
                            className={cn(
                              "flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center",
                              match.result
                                ? "border-primary/30 bg-primary/5"
                                : "border-border bg-secondary/30"
                            )}
                          >
                            <div className="flex items-center gap-3 sm:w-8">
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>

                            <div className="flex flex-1 items-center gap-2">
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {match.league}
                              </Badge>
                              <div className="flex flex-1 items-center justify-center gap-2 text-sm">
                                <span className={cn(
                                  "text-right",
                                  match.result === "home" && "font-bold text-primary"
                                )}>
                                  {match.homeTeam}
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className={cn(
                                  "text-left",
                                  match.result === "away" && "font-bold text-primary"
                                )}>
                                  {match.awayTeam}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end">
                              <Select
                                value={match.result || ""}
                                onValueChange={(v) =>
                                  updateMatchResult(round.id, match.id, v as Result)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Result" />
                                </SelectTrigger>
                                <SelectContent>
                                  {resultOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {match.result && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Publish Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Deadline closed on{" "}
                            {new Date(round.deadline).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <Button
                          onClick={() => publishResults(round.id)}
                          disabled={!isComplete || isPublishing}
                        >
                          {isPublishing ? "Publishing..." : "Publish Results"}
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
      )}
    </div>
  )
}
