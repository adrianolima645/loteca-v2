"use client"

import Link from "next/link"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

type RoundStatus = "not_submitted" | "submitted" | "scored"

interface RoundCardProps {
  roundNumber: number
  closesIn: string
  status: RoundStatus
  score?: number
}

const statusConfig: Record<RoundStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  not_submitted: {
    label: "Not submitted",
    variant: "destructive",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  submitted: {
    label: "Submitted",
    variant: "secondary",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  scored: {
    label: "Scored",
    variant: "default",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
}

export function RoundCard({ roundNumber, closesIn, status, score }: RoundCardProps) {
  const { label, variant, icon } = statusConfig[status]
  // Parse leading hours from strings like "1h 45m" or "12h". Treat < 3 h as urgent.
  const hoursMatch = closesIn.match(/^(\d+)h/)
  const isUrgent = hoursMatch !== null && parseInt(hoursMatch[1], 10) < 3

  return (
    <Card className="min-w-[280px] shrink-0 border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Round #{roundNumber}</h3>
          <Badge variant={variant} className="gap-1">
            {icon}
            {label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className={`h-4 w-4 ${isUrgent ? "text-destructive" : ""}`} />
          <span className={isUrgent ? "font-medium text-destructive" : ""}>
            Closes in {closesIn}
          </span>
        </div>
        {status === "scored" && score !== undefined && (
          <div className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-center">
            <span className="text-sm text-muted-foreground">Score: </span>
            <span className="font-bold text-primary">{score} pts</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border p-4">
        <Button asChild className="w-full" variant={status === "not_submitted" ? "default" : "secondary"}>
          <Link href={`/bet/${roundNumber}`}>
            {status === "not_submitted" ? "Place Bet" : "View Bet"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
