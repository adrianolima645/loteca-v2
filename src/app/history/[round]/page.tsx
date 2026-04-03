import Link from "next/link"
import { ArrowLeft, Check, X } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data - in production this would come from API
const roundData = {
  roundNumber: 47,
  date: "Mar 15, 2026",
  championship: "Monthly League March",
  correct: 10,
  total: 14,
  points: 12.5,
  matches: [
    { id: 1, home: "Flamengo", away: "Palmeiras", league: "Série A", prediction: "H", result: "H", points: 1.0 },
    { id: 2, home: "Corinthians", away: "São Paulo", league: "Série A", prediction: "D", result: "D", points: 1.5 },
    { id: 3, home: "Santos", away: "Grêmio", league: "Série A", prediction: "A", result: "H", points: 0 },
    { id: 4, home: "Cruzeiro", away: "Atlético-MG", league: "Série A", prediction: "H", result: "H", points: 1.0 },
    { id: 5, home: "Botafogo", away: "Fluminense", league: "Série A", prediction: "D", result: "A", points: 0 },
    { id: 6, home: "Vasco", away: "Internacional", league: "Série A", prediction: "A", result: "A", points: 1.0 },
    { id: 7, home: "Bahia", away: "Fortaleza", league: "Série A", prediction: "H", result: "H", points: 1.0 },
    { id: 8, home: "Sport", away: "Náutico", league: "Série B", prediction: "H", result: "H", points: 0.8 },
    { id: 9, home: "Guarani", away: "Ponte Preta", league: "Série B", prediction: "D", result: "D", points: 1.2 },
    { id: 10, home: "CRB", away: "CSA", league: "Série B", prediction: "A", result: "D", points: 0 },
    { id: 11, home: "São Paulo", away: "Athletico-PR", league: "Copa do Brasil", prediction: "H", result: "H", points: 1.2 },
    { id: 12, home: "Palmeiras", away: "Cruzeiro", league: "Copa do Brasil", prediction: "H", result: "H", points: 1.2 },
    { id: 13, home: "Santos", away: "Corinthians", league: "State Cups", prediction: "D", result: "A", points: 0 },
    { id: 14, home: "Flamengo", away: "Botafogo", league: "State Cups", prediction: "H", result: "H", points: 0.6 },
  ],
}

const leagueBadgeClass: Record<string, string> = {
  "Série A": "bg-primary/20 text-primary border-primary/30",
  "Série B": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Copa do Brasil": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "State Cups": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Other": "bg-muted text-muted-foreground border-border",
}

const predictionLabels: Record<string, string> = {
  H: "Home",
  D: "Draw",
  A: "Away",
}

export default async function BetDetailPage({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params

  // In production, fetch data based on round number
  const data = roundData

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-6">
        {/* Back link */}
        <Link href="/history">
          <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Bet History
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Round #{round}
            </h1>
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
              Scored
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {data.date} &middot; {data.championship}
          </p>
        </div>

        {/* Summary Strip */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-center gap-6 p-4 text-center sm:justify-start sm:text-left">
            <div>
              <p className="text-sm text-muted-foreground">Correct Predictions</p>
              <p className="text-2xl font-bold text-foreground">
                {data.correct} <span className="text-lg text-muted-foreground">/ {data.total}</span>
              </p>
            </div>
            <div className="hidden h-10 w-px bg-border sm:block" />
            <div>
              <p className="text-sm text-muted-foreground">Weighted Points</p>
              <p className="text-2xl font-bold text-primary">
                {data.points.toFixed(1)}
              </p>
            </div>
            <div className="hidden h-10 w-px bg-border sm:block" />
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold text-foreground">
                {((data.correct / data.total) * 100).toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Match Results Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Match Results</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead className="hidden sm:table-cell">League</TableHead>
                    <TableHead className="text-center">Prediction</TableHead>
                    <TableHead className="text-center">Result</TableHead>
                    <TableHead className="text-right">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.matches.map((match) => {
                    const isCorrect = match.prediction === match.result
                    return (
                      <TableRow
                        key={match.id}
                        className={`border-border/50 ${
                          isCorrect
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "bg-destructive/5 hover:bg-destructive/10"
                        }`}
                      >
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {match.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {match.home} vs {match.away}
                            </span>
                            <Badge
                              variant="outline"
                              className={`mt-1 w-fit text-xs sm:hidden ${leagueBadgeClass[match.league] || leagueBadgeClass["Other"]}`}
                            >
                              {match.league}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className={leagueBadgeClass[match.league] || leagueBadgeClass["Other"]}
                          >
                            {match.league}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-medium">
                            {predictionLabels[match.prediction]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isCorrect ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <X className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium text-foreground">
                              {predictionLabels[match.result]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              isCorrect ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {match.points.toFixed(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Total Row */}
            <div className="flex items-center justify-between border-t border-border/50 bg-card/50 px-4 py-3">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-primary">
                {data.points.toFixed(1)} points
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
