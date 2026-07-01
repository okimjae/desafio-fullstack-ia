"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Gráfico interativo de volume de projetos por risco"

// Simulando dados de evolução de projetos de Risco Geral e Risco Alto
const chartData = [
  { date: "2024-04-01", altoRisco: 2, riscoGeral: 8 },
  { date: "2024-04-05", altoRisco: 3, riscoGeral: 12 },
  { date: "2024-04-10", altoRisco: 5, riscoGeral: 15 },
  { date: "2024-04-15", altoRisco: 7, riscoGeral: 18 },
  { date: "2024-04-20", altoRisco: 4, riscoGeral: 22 },
  { date: "2024-04-25", altoRisco: 8, riscoGeral: 24 },
  { date: "2024-04-30", altoRisco: 9, riscoGeral: 29 },
  { date: "2024-05-05", altoRisco: 12, riscoGeral: 32 },
  { date: "2024-05-10", altoRisco: 10, riscoGeral: 35 },
  { date: "2024-05-15", altoRisco: 15, riscoGeral: 40 },
  { date: "2024-05-20", altoRisco: 14, riscoGeral: 44 },
  { date: "2024-05-25", altoRisco: 18, riscoGeral: 48 },
  { date: "2024-05-30", altoRisco: 20, riscoGeral: 52 },
  { date: "2024-06-05", altoRisco: 22, riscoGeral: 58 },
  { date: "2024-06-10", altoRisco: 25, riscoGeral: 64 },
  { date: "2024-06-15", altoRisco: 23, riscoGeral: 72 },
  { date: "2024-06-20", altoRisco: 29, riscoGeral: 79 },
  { date: "2024-06-25", altoRisco: 32, riscoGeral: 85 },
  { date: "2024-06-30", altoRisco: 35, riscoGeral: 92 },
]

const chartConfig = {
  projects: {
    label: "Projetos",
  },
  altoRisco: {
    label: "Risco Alto",
    color: "hsl(var(--destructive))",
  },
  riscoGeral: {
    label: "Baixo/Médio Risco",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Histórico de Demandas</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Evolução de propostas e análises nos últimos 3 meses
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">90 dias</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Selecionar período"
            >
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                90 dias
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAltoRisco" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-altoRisco)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-altoRisco)"
                  stopOpacity={0.01}
                />
              </linearGradient>
              <linearGradient id="fillRiscoGeral" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-riscoGeral)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-riscoGeral)"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "long",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="riscoGeral"
              type="natural"
              fill="url(#fillRiscoGeral)"
              stroke="var(--color-riscoGeral)"
              stackId="a"
            />
            <Area
              dataKey="altoRisco"
              type="natural"
              fill="url(#fillAltoRisco)"
              stroke="var(--color-altoRisco)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
