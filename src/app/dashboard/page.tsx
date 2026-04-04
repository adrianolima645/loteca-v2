"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { RoundCard } from "@/components/round-card"
import { Leaderboard } from "@/components/leaderboard"
import { StatsCard } from "@/components/stats-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const openRounds = [
  { roundNumber: 48, closesIn: "2h 15m", status: "not_submitted" as const },
  { roundNumber: 47, closesIn: "14h 32m", status: "submitted" as const },
  { roundNumber: 46, closesIn: "3d 8h", status: "scored" as const, score: 11 },
]

const championships = [
  { id: "mar", name: "March Monthly League" },
  { id: "feb", name: "February Monthly League" },
  { id: "annual", name: "Annual League 2026" },
]

const leaderboardData = [
  { rank: 1, username: "Carlos_BR", initials: "CB", totalPoints: 156, roundsPlayed: 12, correctPredictions: 98, isCurrentUser: false },
  { rank: 2, username: "Maria_Goals", initials: "MG", totalPoints: 148, roundsPlayed: 12, correctPredictions: 92, isCurrentUser: false },
  { rank: 3, username: "Pedro_Futebol", initials: "PF", totalPoints: 142, roundsPlayed: 11, correctPredictions: 88, isCurrentUser: false },
  { rank: 4, username: "Ana_Torcedora", initials: "AT", totalPoints: 138, roundsPlayed: 12, correctPredictions: 85, isCurrentUser: false },
  { rank: 5, username: "João Silva", initials: "JS", totalPoints: 134, roundsPlayed: 12, correctPredictions: 82, isCurrentUser: true },
  { rank: 6, username: "Lucas_SP", initials: "LS", totalPoints: 128, roundsPlayed: 10, correctPredictions: 78, isCurrentUser: false },
  { rank: 7, username: "Fernanda_RJ", initials: "FR", totalPoints: 122, roundsPlayed: 11, correctPredictions: 75, isCurrentUser: false },
  { rank: 8, username: "Gabriel_MG", initials: "GM", totalPoints: 118, roundsPlayed: 12, correctPredictions: 72, isCurrentUser: false },
]

export default function DashboardPage() {
  const [activeChampionship, setActiveChampionship] = useState("mar")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Open Rounds */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Open Rounds</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {openRounds.map((round) => (
                <RoundCard
                  key={round.roundNumber}
                  roundNumber={round.roundNumber}
                  closesIn={round.closesIn}
                  status={round.status}
                  score={round.score}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Leaderboard */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Active Championships</h2>
            <Tabs value={activeChampionship} onValueChange={setActiveChampionship}>
              <TabsList className="mb-4 w-full justify-start bg-muted/50">
                {championships.map((champ) => (
                  <TabsTrigger
                    key={champ.id}
                    value={champ.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {champ.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {championships.map((champ) => (
                <TabsContent key={champ.id} value={champ.id}>
                  <Leaderboard entries={leaderboardData} remainingRounds={4} />
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Stats Sidebar — desktop */}
          <aside className="hidden lg:block">
            <StatsCard
              rank={5}
              totalPoints={134}
              accuracy={68}
              championship="March Monthly League"
            />
          </aside>
        </div>

        {/* Stats Card — mobile */}
        <div className="mt-6 lg:hidden">
          <StatsCard
            rank={5}
            totalPoints={134}
            accuracy={68}
            championship="March Monthly League"
          />
        </div>
      </main>
    </div>
  )
}
