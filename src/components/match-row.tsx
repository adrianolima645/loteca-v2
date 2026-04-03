"use client"

import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Prediction = "home" | "draw" | "away" | null

type League = "serie_a" | "serie_b" | "copa_brasil" | "estadual" | "other"

interface MatchRowProps {
  matchNumber: number
  homeTeam: string
  awayTeam: string
  league: League
  prediction: Prediction
  onPredictionChange: (value: Prediction) => void
}

const leagueConfig: Record<League, { label: string; className: string }> = {
  serie_a: { label: "Série A", className: "bg-primary/20 text-primary" },
  serie_b: { label: "Série B", className: "bg-blue-500/20 text-blue-400" },
  copa_brasil: { label: "Copa do Brasil", className: "bg-yellow-500/20 text-yellow-400" },
  estadual: { label: "State Cups", className: "bg-purple-500/20 text-purple-400" },
  other: { label: "Other", className: "bg-muted text-muted-foreground" },
}

export function MatchRow({
  matchNumber,
  homeTeam,
  awayTeam,
  league,
  prediction,
  onPredictionChange,
}: MatchRowProps) {
  const leagueInfo = leagueConfig[league]

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Match Info */}
        <div className="flex flex-1 items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground">
            {matchNumber}
          </span>
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={leagueInfo.className}>
                {leagueInfo.label}
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{homeTeam}</span>
              <span className="mx-2 text-muted-foreground">vs</span>
              <span>{awayTeam}</span>
            </p>
          </div>
        </div>

        {/* Prediction Toggle */}
        <ToggleGroup
          type="single"
          value={prediction || ""}
          onValueChange={(value) => onPredictionChange(value as Prediction || null)}
          className="shrink-0"
        >
          <ToggleGroupItem
            value="home"
            aria-label="Home wins"
            className="h-10 min-w-[64px] border border-border data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Home
          </ToggleGroupItem>
          <ToggleGroupItem
            value="draw"
            aria-label="Draw"
            className="h-10 min-w-[64px] border border-border data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Draw
          </ToggleGroupItem>
          <ToggleGroupItem
            value="away"
            aria-label="Away wins"
            className="h-10 min-w-[64px] border border-border data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Away
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
