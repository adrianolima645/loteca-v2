"use client"

import { useState } from "react"
import {
  Save,
  RotateCcw,
  Info,
  Trophy,
  Target,
  Zap,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

interface ScoringRule {
  id: string
  label: string
  description: string
  icon: typeof Trophy
  value: number
  enabled: boolean
}

const defaultRules: ScoringRule[] = [
  {
    id: "correct_result",
    label: "Correct Prediction",
    description: "Points for predicting the correct winner or draw",
    icon: Target,
    value: 10,
    enabled: true,
  },
  {
    id: "perfect_round",
    label: "Perfect Round",
    description: "Bonus for predicting all 14 matches correctly",
    icon: Trophy,
    value: 50,
    enabled: true,
  },
  {
    id: "streak_bonus",
    label: "Streak Bonus",
    description: "Bonus for 5+ consecutive correct predictions in a round",
    icon: Zap,
    value: 15,
    enabled: true,
  },
  {
    id: "participation",
    label: "Participation",
    description: "Points just for participating (submitting a bet)",
    icon: TrendingUp,
    value: 2,
    enabled: false,
  },
]

export default function ScoringRulesPage() {
  const [rules, setRules] = useState<ScoringRule[]>(defaultRules)
  const [isSaving, setIsSaving] = useState(false)

  const updateRule = (id: string, field: "value" | "enabled", newValue: number | boolean) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, [field]: newValue } : rule
      )
    )
  }

  const resetToDefaults = () => {
    setRules(defaultRules)
    toast.info("Rules restored to defaults")
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Scoring rules saved successfully!")
    setIsSaving(false)
  }

  // Calculate example scenario
  const calculateExample = () => {
    const correctResult = rules.find((r) => r.id === "correct_result")
    const streakBonus = rules.find((r) => r.id === "streak_bonus")
    const participation = rules.find((r) => r.id === "participation")

    let total = 0

    // 10 correct predictions
    if (correctResult?.enabled) {
      total += 10 * correctResult.value
    }

    // 1 streak of 5+
    if (streakBonus?.enabled) {
      total += streakBonus.value
    }

    // Participation
    if (participation?.enabled) {
      total += participation.value
    }

    return total
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scoring Rules</h1>
            <p className="text-muted-foreground">
              Configure how points are calculated
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Defaults
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Rules Configuration */}
          <div className="space-y-4 lg:col-span-2">
            {rules.map((rule) => (
              <Card key={rule.id} className={!rule.enabled ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <rule.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rule.label}</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{rule.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${rule.id}-value`} className="text-sm text-muted-foreground">
                          Points:
                        </Label>
                        <Input
                          id={`${rule.id}-value`}
                          type="number"
                          className="w-20"
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, "value", parseInt(e.target.value) || 0)}
                          disabled={!rule.enabled}
                        />
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(v) => updateRule(rule.id, "enabled", v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Simulation</CardTitle>
                <CardDescription>
                  Example with 10 correct predictions and 1 streak of 5+
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rules
                    .filter((r) => r.enabled)
                    .map((rule) => {
                      let points = 0
                      if (rule.id === "correct_result") points = 10 * rule.value
                      else if (rule.id === "streak_bonus") points = rule.value
                      else if (rule.id === "participation") points = rule.value

                      return (
                        <div key={rule.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{rule.label}</span>
                          <span className="font-medium">+{points}</span>
                        </div>
                      )
                    })}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="text-lg font-bold text-primary">
                        {calculateExample()} pts
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Correct Prediction</strong> is the main rule.
                  Values between 10–15 are recommended.
                </p>
                <p>
                  <strong className="text-foreground">Perfect Round</strong> encourages engagement.
                  Keep it high to build excitement.
                </p>
                <p>
                  <strong className="text-foreground">Participation</strong> is useful to keep
                  players engaged even with few correct predictions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
