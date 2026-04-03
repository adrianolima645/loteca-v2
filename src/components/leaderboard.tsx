"use client"

import { Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LeaderboardEntry {
  rank: number
  username: string
  avatar?: string
  initials: string
  totalPoints: number
  roundsPlayed: number
  correctPredictions: number
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  remainingRounds: number
}

export function Leaderboard({ entries, remainingRounds }: LeaderboardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-muted-foreground">#</TableHead>
            <TableHead className="text-muted-foreground">Player</TableHead>
            <TableHead className="text-right text-muted-foreground">Points</TableHead>
            <TableHead className="hidden text-right text-muted-foreground sm:table-cell">Rounds</TableHead>
            <TableHead className="hidden text-right text-muted-foreground md:table-cell">Correct</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.rank}
              className={`border-border transition-colors ${
                entry.isCurrentUser
                  ? "bg-primary/10 hover:bg-primary/15"
                  : "hover:bg-muted/50"
              }`}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-1">
                  {entry.rank === 1 && <Trophy className="h-4 w-4 text-gold" />}
                  {entry.rank === 2 && <Trophy className="h-4 w-4 text-muted-foreground" />}
                  {entry.rank === 3 && <Trophy className="h-4 w-4 text-gold/60" />}
                  <span className={entry.isCurrentUser ? "text-primary" : "text-foreground"}>
                    {entry.rank}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatar} alt={entry.username} />
                    <AvatarFallback className="bg-primary/20 text-xs text-primary">
                      {entry.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`font-medium ${entry.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                    {entry.username}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className={`font-bold ${entry.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                  {entry.totalPoints}
                </span>
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                {entry.roundsPlayed}
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                {entry.correctPredictions}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
        Remaining rounds in this championship: <span className="font-medium text-foreground">{remainingRounds}</span>
      </div>
    </div>
  )
}
