"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, ChevronDown, ChevronUp, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Mock data
const championshipData = {
  id: "1",
  name: "Monthly League February",
  dateRange: "Feb 1 - Feb 28, 2026",
  status: "CLOSED",
  currentUserRank: 5,
  leaderboard: [
    {
      rank: 1,
      name: "Carlos Silva",
      avatar: "",
      initials: "CS",
      totalPoints: 145.5,
      roundsPlayed: 4,
      correctPredictions: 42,
      isCurrentUser: false,
      rounds: [
        { round: 44, points: 38.5, correct: 11 },
        { round: 43, points: 36.0, correct: 10 },
        { round: 42, points: 35.0, correct: 10 },
        { round: 41, points: 36.0, correct: 11 },
      ],
    },
    {
      rank: 2,
      name: "Ana Costa",
      avatar: "",
      initials: "AC",
      totalPoints: 142.0,
      roundsPlayed: 4,
      correctPredictions: 40,
      isCurrentUser: false,
      rounds: [
        { round: 44, points: 36.0, correct: 10 },
        { round: 43, points: 35.5, correct: 10 },
        { round: 42, points: 36.0, correct: 10 },
        { round: 41, points: 34.5, correct: 10 },
      ],
    },
    {
      rank: 3,
      name: "Pedro Santos",
      avatar: "",
      initials: "PS",
      totalPoints: 138.5,
      roundsPlayed: 4,
      correctPredictions: 39,
      isCurrentUser: false,
      rounds: [
        { round: 44, points: 35.0, correct: 10 },
        { round: 43, points: 34.0, correct: 9 },
        { round: 42, points: 35.5, correct: 10 },
        { round: 41, points: 34.0, correct: 10 },
      ],
    },
    {
      rank: 4,
      name: "Maria Oliveira",
      avatar: "",
      initials: "MO",
      totalPoints: 135.0,
      roundsPlayed: 4,
      correctPredictions: 38,
      isCurrentUser: false,
      rounds: [
        { round: 44, points: 34.0, correct: 9 },
        { round: 43, points: 33.5, correct: 9 },
        { round: 42, points: 34.0, correct: 10 },
        { round: 41, points: 33.5, correct: 10 },
      ],
    },
    {
      rank: 5,
      name: "João Silva",
      avatar: "",
      initials: "JS",
      totalPoints: 132.5,
      roundsPlayed: 4,
      correctPredictions: 37,
      isCurrentUser: true,
      rounds: [
        { round: 44, points: 33.5, correct: 9 },
        { round: 43, points: 33.0, correct: 9 },
        { round: 42, points: 33.0, correct: 9 },
        { round: 41, points: 33.0, correct: 10 },
      ],
    },
    {
      rank: 6,
      name: "Lucas Ferreira",
      avatar: "",
      initials: "LF",
      totalPoints: 128.0,
      roundsPlayed: 4,
      correctPredictions: 35,
      isCurrentUser: false,
      rounds: [
        { round: 44, points: 32.0, correct: 9 },
        { round: 43, points: 32.0, correct: 8 },
        { round: 42, points: 32.0, correct: 9 },
        { round: 41, points: 32.0, correct: 9 },
      ],
    },
  ],
}

function LeaderboardRow({ player }: { player: typeof championshipData.leaderboard[0] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow
        className={`border-border/50 ${
          player.isCurrentUser
            ? "bg-primary/10 hover:bg-primary/15"
            : "hover:bg-accent/50"
        }`}
      >
        <TableCell className="text-center">
          <div className="flex items-center justify-center">
            {player.rank === 1 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
            ) : player.rank === 2 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400/20">
                <Award className="h-4 w-4 text-gray-400" />
              </div>
            ) : player.rank === 3 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
                <Award className="h-4 w-4 text-orange-500" />
              </div>
            ) : (
              <span className="font-medium text-muted-foreground">{player.rank}</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={player.avatar} />
              <AvatarFallback
                className={`text-xs ${
                  player.isCurrentUser
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {player.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className={`font-medium ${player.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                {player.name}
              </span>
              {player.isCurrentUser && (
                <Badge variant="outline" className="ml-2 border-primary/30 bg-primary/20 text-xs text-primary">
                  You
                </Badge>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center font-semibold text-primary">
          {player.totalPoints.toFixed(1)}
        </TableCell>
        <TableCell className="hidden text-center text-muted-foreground sm:table-cell">
          {player.roundsPlayed}
        </TableCell>
        <TableCell className="hidden text-center text-muted-foreground md:table-cell">
          {player.correctPredictions}
        </TableCell>
        <TableCell className="text-center">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Expand</span>
            </Button>
          </CollapsibleTrigger>
        </TableCell>
      </TableRow>

      <CollapsibleContent asChild>
        <tr>
          <td colSpan={6} className="p-0">
            <div className="border-t border-border/30 bg-accent/30 px-4 py-3">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Score by Round
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {player.rounds.map((round) => (
                  <div
                    key={round.round}
                    className="rounded-md bg-background/50 p-2 text-center"
                  >
                    <p className="text-xs text-muted-foreground">Round {round.round}</p>
                    <p className="font-semibold text-foreground">
                      {round.points.toFixed(1)} pts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {round.correct}/14 correct
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function ChampionshipDetailPage() {
  const data = championshipData

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-6">
        {/* Back link */}
        <Link href="/championships">
          <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Championship History
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {data.status}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{data.dateRange}</p>
        </div>

        {/* User Callout */}
        {data.currentUserRank && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <span className="text-xl font-bold text-primary">#{data.currentUserRank}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">You finished #{data.currentUserRank}</p>
                <p className="text-sm text-muted-foreground">
                  Congratulations on participating in this championship!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Final Standings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-16 text-center">Pos.</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="hidden text-center sm:table-cell">Rounds</TableHead>
                    <TableHead className="hidden text-center md:table-cell">Correct</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.leaderboard.map((player) => (
                    <LeaderboardRow key={player.rank} player={player} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
