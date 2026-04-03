"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Calendar, RotateCcw, Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

// Mock data
const championships = [
  { id: "1", name: "Monthly League March" },
  { id: "2", name: "Monthly League February" },
  { id: "3", name: "Annual Championship 2026" },
]

const betHistory = [
  {
    id: "1",
    roundNumber: 47,
    date: "Mar 15, 2026",
    championship: "Monthly League March",
    status: "scored" as const,
    correct: 10,
    total: 14,
    points: 12.5,
  },
  {
    id: "2",
    roundNumber: 46,
    date: "Mar 8, 2026",
    championship: "Monthly League March",
    status: "scored" as const,
    correct: 8,
    total: 14,
    points: 9.0,
  },
  {
    id: "3",
    roundNumber: 45,
    date: "Mar 1, 2026",
    championship: "Monthly League March",
    status: "pending" as const,
    correct: 0,
    total: 14,
    points: 0,
  },
  {
    id: "4",
    roundNumber: 44,
    date: "Feb 22, 2026",
    championship: "Monthly League February",
    status: "scored" as const,
    correct: 11,
    total: 14,
    points: 14.5,
  },
  {
    id: "5",
    roundNumber: 43,
    date: "Feb 15, 2026",
    championship: "Monthly League February",
    status: "not_participated" as const,
    correct: 0,
    total: 14,
    points: 0,
  },
]

const statusConfig = {
  scored: {
    label: "Scored",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  pending: {
    label: "Pending Results",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  not_participated: {
    label: "Did Not Participate",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export default function HistoryPage() {
  const [selectedChampionship, setSelectedChampionship] = useState<string>("all")
  const [roundFilter, setRoundFilter] = useState("")
  const [filteredBets, setFilteredBets] = useState(betHistory)

  const handleFilter = () => {
    let results = betHistory

    if (selectedChampionship !== "all") {
      const champ = championships.find((c) => c.id === selectedChampionship)
      if (champ) {
        results = results.filter((bet) => bet.championship === champ.name)
      }
    }

    if (roundFilter) {
      results = results.filter((bet) => bet.roundNumber.toString().includes(roundFilter))
    }

    setFilteredBets(results)
  }

  const handleReset = () => {
    setSelectedChampionship("all")
    setRoundFilter("")
    setFilteredBets(betHistory)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Bet History</h1>
          <p className="mt-1 text-muted-foreground">
            View your past bets and performance by round
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6 border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">Championship</label>
                <Select value={selectedChampionship} onValueChange={setSelectedChampionship}>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="All championships" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All championships</SelectItem>
                    {championships.map((champ) => (
                      <SelectItem key={champ.id} value={champ.id}>
                        {champ.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full space-y-2 sm:w-40">
                <label className="text-sm font-medium text-foreground">Round</label>
                <Input
                  type="text"
                  placeholder="e.g. 47"
                  value={roundFilter}
                  onChange={(e) => setRoundFilter(e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleFilter} className="flex-1 sm:flex-none">
                  <Search className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Clear filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        {filteredBets.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Calendar className="h-10 w-10" /></EmptyMedia>
              <EmptyTitle>No bets found</EmptyTitle>
              <EmptyDescription>We couldn&apos;t find any bets matching the selected filters.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {filteredBets.map((bet) => (
              <Link key={bet.id} href={`/history/${bet.roundNumber}`}>
                <Card className="border-border/50 bg-card/50 transition-colors hover:border-primary/50 hover:bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Round info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            Round #{bet.roundNumber}
                          </h3>
                          <Badge
                            variant="outline"
                            className={statusConfig[bet.status].className}
                          >
                            {statusConfig[bet.status].label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {bet.date}
                          </span>
                          <span>{bet.championship}</span>
                        </div>
                      </div>

                      {/* Right: Stats */}
                      <div className="flex items-center gap-4">
                        {bet.status === "scored" && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {bet.correct} / {bet.total} correct
                            </p>
                            <p className="font-semibold text-primary">
                              {bet.points.toFixed(1)} pts
                            </p>
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination hint */}
        {filteredBets.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full sm:w-auto">
              Load more
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
