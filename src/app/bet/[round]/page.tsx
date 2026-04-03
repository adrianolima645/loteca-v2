"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { MatchRow } from "@/components/match-row"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

type Prediction = "home" | "draw" | "away" | null
type League = "serie_a" | "serie_b" | "copa_brasil" | "estadual" | "other"

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  league: League
}

// Mock data for demonstration
const mockMatches: Match[] = [
  { id: 1, homeTeam: "Flamengo", awayTeam: "Palmeiras", league: "serie_a" },
  { id: 2, homeTeam: "Corinthians", awayTeam: "São Paulo", league: "serie_a" },
  { id: 3, homeTeam: "Internacional", awayTeam: "Grêmio", league: "serie_a" },
  { id: 4, homeTeam: "Atlético-MG", awayTeam: "Cruzeiro", league: "serie_a" },
  { id: 5, homeTeam: "Fluminense", awayTeam: "Botafogo", league: "serie_a" },
  { id: 6, homeTeam: "Santos", awayTeam: "Vasco", league: "serie_b" },
  { id: 7, homeTeam: "Bahia", awayTeam: "Vitória", league: "serie_a" },
  { id: 8, homeTeam: "Athletico-PR", awayTeam: "Coritiba", league: "serie_a" },
  { id: 9, homeTeam: "Fortaleza", awayTeam: "Ceará", league: "serie_a" },
  { id: 10, homeTeam: "Sport", awayTeam: "Náutico", league: "serie_b" },
  { id: 11, homeTeam: "América-MG", awayTeam: "Atlético-GO", league: "serie_b" },
  { id: 12, homeTeam: "Cuiabá", awayTeam: "Goiás", league: "serie_a" },
  { id: 13, homeTeam: "RB Bragantino", awayTeam: "Juventude", league: "serie_a" },
  { id: 14, homeTeam: "Criciúma", awayTeam: "Chapecoense", league: "serie_b" },
]

interface BetPageProps {
  params: Promise<{ round: string }>
}

export default function BetPage({ params }: BetPageProps) {
  const { round } = use(params)
  const roundNumber = parseInt(round, 10)

  // Simulated state — in production, this would come from the backend
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Urgency simulation
  const isUrgent = true // Less than 2 hours
  const closesIn = "1h 45m"

  const filledCount = Object.values(predictions).filter(Boolean).length
  const totalMatches = mockMatches.length
  const progress = (filledCount / totalMatches) * 100
  const isComplete = filledCount === totalMatches

  const handlePredictionChange = (matchId: number, value: Prediction) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!isComplete) return

    setIsLoading(true)
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubmitted(true)
    toast.success("Predictions saved successfully!", {
      description: `Your bet for Round #${roundNumber} has been recorded.`,
    })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />

      <main className="container px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Round #{roundNumber}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Closes in</span>
                <Badge
                  variant={isUrgent ? "destructive" : "secondary"}
                  className="font-mono"
                >
                  {closesIn}
                </Badge>
              </div>
            </div>

            {isSubmitted && (
              <Badge className="gap-1 bg-primary/20 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Bet Submitted
              </Badge>
            )}
          </div>
        </div>

        {/* Urgent Warning */}
        {isUrgent && !isSubmitted && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning!</strong> This round closes in less than 2 hours.
              Submit your bet before the deadline.
            </AlertDescription>
          </Alert>
        )}

        {/* Match List */}
        <div className="space-y-3">
          {mockMatches.map((match) => (
            <MatchRow
              key={match.id}
              matchNumber={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              league={match.league}
              prediction={predictions[match.id] || null}
              onPredictionChange={(value) =>
                handlePredictionChange(match.id, value)
              }
            />
          ))}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {filledCount} / {totalMatches} selected
              </span>
              <span className="font-medium text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            className="min-w-[180px]"
            size="lg"
          >
            {isLoading
              ? "Saving..."
              : isSubmitted
              ? "Update Predictions"
              : "Submit Predictions"}
          </Button>
        </div>
      </div>
    </div>
  )
}
