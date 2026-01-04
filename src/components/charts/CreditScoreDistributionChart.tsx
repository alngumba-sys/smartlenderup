import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface CreditScoreDistributionChartProps {
  stats: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    highRisk: number;
  };
}

const chartConfig = {
  count: {
    label: "Clients",
    color: "hsl(var(--chart-2))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig

export function CreditScoreDistributionChart({ stats }: CreditScoreDistributionChartProps) {
  const chartData = [
    { 
      category: "Excellent", 
      range: "(750+)", 
      fullLabel: "Excellent (750+)",
      count: stats.excellent, 
      fill: "#10b981" 
    },
    { 
      category: "Good", 
      range: "(650-749)", 
      fullLabel: "Good (650-749)",
      count: stats.good, 
      fill: "#3b82f6" 
    },
    { 
      category: "Fair", 
      range: "(550-649)", 
      fullLabel: "Fair (550-649)",
      count: stats.fair, 
      fill: "#f59e0b" 
    },
    { 
      category: "Poor", 
      range: "(450-549)", 
      fullLabel: "Poor (450-549)",
      count: stats.poor, 
      fill: "#f97316" 
    },
    { 
      category: "High Risk", 
      range: "(<450)", 
      fullLabel: "High Risk (<450)",
      count: stats.highRisk, 
      fill: "#ef4444" 
    },
  ]

  // Find the maximum count to scale the chart properly
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  const domain = [0, maxCount * 1.08]; // Reduced padding to stretch bars more

  // Custom label renderer for two-line format
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value, index } = props;
    const data = chartData[index];
    
    return (
      <g>
        {/* Category name - larger */}
        <text
          x={x + 12}
          y={y + height / 2 - 4}
          fill="white"
          fontSize={16}
          fontWeight={600}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {data.category}
        </text>
        {/* Range - smaller, below */}
        <text
          x={x + 12}
          y={y + height / 2 + 12}
          fill="white"
          fontSize={13}
          fontWeight={400}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {data.range}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-gray-900 mb-4">Credit Score Distribution</h3>
      <div className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full min-h-[300px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 40,
              left: 4,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="fullLabel"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="count" type="number" hide domain={domain} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              layout="vertical"
              radius={4}
              barSize={52}
            >
              <LabelList
                content={renderCustomLabel}
              />
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={14}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}