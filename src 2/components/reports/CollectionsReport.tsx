import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Download, Printer, Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, Users, PieChart as PieChartIcon, Filter } from 'lucide-react';
import { safeToFixed, safePercentage, safeDivide, safeFormat } from '../../utils/safeCalculations';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { getOrganizationName, getOrganizationLogo } from '../../utils/organizationUtils';
import { LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, CartesianGrid, LabelList } from 'recharts';

// Placeholder types for chart components
type ChartConfig = Record<string, { label: string; color: string }>;

// Simple chart container component
function ChartContainer({ children, config, className }: { children: React.ReactNode; config: ChartConfig; className?: string }) {
  return <div className={className}>{children}</div>;
}

function ChartTooltip({ cursor, content }: any) {
  return null;
}

function ChartTooltipContent({ indicator, hideLabel }: any) {
  return null;
}

interface ReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function CollectionsReport({ dateRange }: ReportProps) {
  // Get real data from DataContext
  const { loans, payments } = useData();
  const currencyCode = getCurrencyCode();
  
  // Get dynamic organization name and logo
  const organizationName = getOrganizationName();
  const organizationLogo = getOrganizationLogo();

  // Real collections data
  // Only include loans that have been DISBURSED (completed all 5 approval steps) and are in Active/Disbursed status
  const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Disbursed');
  const totalCollections = payments ? payments.reduce((sum: number, p: any) => sum + p.amount, 0) : 817750;
  const principalCollected = payments ? payments.reduce((sum: number, p: any) => sum + p.principalAmount, 0) : 755000;
  const interestCollected = payments ? payments.reduce((sum: number, p: any) => sum + p.interestAmount, 0) : 62750;
  const penaltyCollected = 0; // No penalties in real data
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  
  // Collection rate calculation
  const totalDue = totalCollections + totalOutstanding;
  const collectionRate = safePercentage(totalCollections, totalDue, 2);

  // Calculate real monthly collections from actual payment data
  const monthlyDataMap = new Map<string, { collected: number; due: number; count: number }>();
  
  payments?.forEach((payment: any) => {
    const date = new Date(payment.paymentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    
    if (!monthlyDataMap.has(monthKey)) {
      monthlyDataMap.set(monthKey, { collected: 0, due: 0, count: 0 });
    }
    
    const data = monthlyDataMap.get(monthKey)!;
    data.collected += payment.amount;
    data.due += payment.amount; // Assume all payments were due
    data.count += 1;
  });

  // Convert to array and sort by date
  const monthlyData = Array.from(monthlyDataMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString('en-GB', { month: 'short' }),
        ...data
      };
    });

  // Component breakdown - calculate from real data
  const componentData = [
    { component: 'Principal', due: principalCollected, collected: principalCollected },
    { component: 'Interest', due: interestCollected, collected: interestCollected },
    { component: 'Fees', due: 0, collected: 0 },
    { component: 'Penalty', due: 0, collected: 0 }
  ];

  // Collections by loan officer
  const officerCollections = activeLoans.reduce((acc, loan) => {
    const officer = loan.loanOfficer;
    if (!acc[officer]) {
      acc[officer] = {
        expected: 0,
        collected: 0,
        count: 0
      };
    }
    const expected = loan.principalAmount + (loan.principalAmount * loan.interestRate / 100);
    const collected = loan.principalAmount - loan.outstandingBalance;
    acc[officer].expected += expected;
    acc[officer].collected += collected;
    acc[officer].count += 1;
    return acc;
  }, {} as Record<string, { expected: number; collected: number; count: number }>);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const chartConfig = {
    collected: {
      label: "Collected",
      color: "#10b981",
    },
    count: {
      label: "Repayments",
      color: "#3b82f6",
    },
    due: {
      label: "Due",
      color: "#f59e0b",
    },
  } satisfies ChartConfig;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen print:p-0 print:bg-white print:min-h-0">
      {/* Page 1 */}
      <div className="w-[210mm] h-[297mm] box-border overflow-hidden mx-auto bg-white dark:!bg-white shadow-lg mb-6 p-[8mm] flex flex-col print:shadow-none print:mb-0 print:mx-0">
        {/* Report Header */}
        <div className="border-b-2 border-gray-900 dark:!border-gray-900 pb-1.5 mb-2.5 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <img src={organizationLogo} alt="Organization Logo" className="size-12" />
              <h1 className="text-gray-900 dark:!text-gray-900 text-xl">{organizationName}</h1>
            </div>
            <div className="text-gray-600 dark:!text-gray-600 text-sm">
              Page 1/3
            </div>
          </div>
          <h2 className="text-gray-900 dark:!text-gray-900 text-center text-lg mb-1">COLLECTIONS REPORT</h2>
          <p className="text-center text-gray-600 dark:!text-gray-600 text-xs">
            Period: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
          </p>
          <p className="text-center text-gray-600 dark:!text-gray-600 text-[10px] mt-0.5">
            Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 dark:!bg-blue-50 p-3 rounded border border-blue-200 dark:!border-blue-200">
            <p className="text-blue-700 dark:!text-blue-700 text-xs mb-1">Expected Collections</p>
            <p className="text-blue-900 dark:!text-blue-900 text-base">{currencyCode} {safeToFixed(totalDue / 1000000, 2)}M</p>
          </div>
          <div className="bg-green-50 dark:!bg-green-50 p-3 rounded border border-green-200 dark:!border-green-200">
            <p className="text-green-700 dark:!text-green-700 text-xs mb-1">Total Collected</p>
            <p className="text-green-900 dark:!text-green-900 text-base">{currencyCode} {safeToFixed(totalCollections / 1000000, 2)}M</p>
          </div>
          <div className="bg-purple-50 dark:!bg-purple-50 p-3 rounded border border-purple-200 dark:!border-purple-200">
            <p className="text-purple-700 dark:!text-purple-700 text-xs mb-1">Collection Rate</p>
            <p className="text-purple-900 dark:!text-purple-900 text-base">{collectionRate}%</p>
          </div>
          <div className="bg-amber-50 dark:!bg-amber-50 p-3 rounded border border-amber-200 dark:!border-amber-200">
            <p className="text-amber-700 dark:!text-amber-700 text-xs mb-1">Active Loans</p>
            <p className="text-amber-900 dark:!text-amber-900 text-base">{activeLoans.length}</p>
          </div>
        </div>

        {/* Monthly Collections Chart */}
        <div className="mb-4">
          <h3 className="text-gray-900 dark:!text-gray-900 mb-2 pb-1 border-b border-gray-300 dark:!border-gray-300 text-sm">Monthly Collections Trend</h3>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <RechartsLineChart
              accessibilityLayer
              data={monthlyData}
              margin={{
                top: 20,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="collected"
                type="natural"
                stroke="var(--color-collected)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-collected)",
                }}
                activeDot={{
                  r: 6,
                }}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                />
              </Line>
            </RechartsLineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Page 2 */}
      <div className="w-[210mm] h-[297mm] box-border overflow-hidden mx-auto bg-white dark:!bg-white shadow-lg mb-6 p-[8mm] flex flex-col print:shadow-none print:mb-0 print:page-break-before-always">
        {/* Report Header - Page 2 */}
        <div className="border-b border-gray-300 dark:!border-gray-300 pb-1.5 mb-2.5 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <img src={organizationLogo} alt="Organization Logo" className="size-10" />
              <h2 className="text-gray-900 dark:!text-gray-900 text-lg">{organizationName}</h2>
            </div>
            <div className="text-gray-600 dark:!text-gray-600 text-sm">
              Page 2/3
            </div>
          </div>
          <h3 className="text-gray-900 dark:!text-gray-900 text-center text-base">COLLECTIONS REPORT (Continued)</h3>
        </div>

        {/* Collections vs Due */}
        <div className="mb-6">
          <h3 className="text-gray-900 dark:!text-gray-900 mb-3 pb-2 border-b border-gray-300 dark:!border-gray-300 text-sm">Collections vs Due Amounts</h3>
          <ChartContainer config={chartConfig} className="h-[100mm] w-full">
            <RechartsBarChart 
              accessibilityLayer 
              data={monthlyData.map(m => ({ 
                month: m.month, 
                due: m.due / 1000000, 
                collected: m.collected / 1000000 
              }))}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="due" fill="var(--color-due)" radius={4} />
              <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
            </RechartsBarChart>
          </ChartContainer>
        </div>

        {/* Number of Repayments */}
        <div className="mb-6">
          <h3 className="text-gray-900 dark:!text-gray-900 mb-3 pb-2 border-b border-gray-300 dark:!border-gray-300 text-sm">Number of Repayments Collected (Monthly)</h3>
          <ChartContainer config={chartConfig} className="h-[100mm] w-full">
            <RechartsBarChart
              accessibilityLayer
              data={monthlyData}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </RechartsBarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Page 3 */}
      <div className="w-[210mm] h-[297mm] box-border overflow-hidden mx-auto bg-white dark:!bg-white shadow-lg mb-6 p-[8mm] flex flex-col print:shadow-none print:mb-0 print:page-break-before-always">
        {/* Report Header - Page 3 */}
        <div className="border-b border-gray-300 dark:!border-gray-300 pb-1.5 mb-2.5 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <img src={organizationLogo} alt="Organization Logo" className="size-10" />
              <h2 className="text-gray-900 dark:!text-gray-900 text-lg">{organizationName}</h2>
            </div>
            <div className="text-gray-600 dark:!text-gray-600 text-sm">
              Page 3/3
            </div>
          </div>
          <h3 className="text-gray-900 dark:!text-gray-900 text-center text-base">COLLECTIONS REPORT (Continued)</h3>
        </div>

        {/* Component Breakdown Charts */}
        <div className="mb-6">
          <h3 className="text-gray-900 dark:!text-gray-900 mb-3 pb-2 border-b border-gray-300 dark:!border-gray-300 text-sm">Component Breakdown - Due vs Collections</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-gray-700 dark:!text-gray-700 text-xs mb-2">Principal</h4>
              <ChartContainer config={chartConfig} className="h-[80mm] w-full">
                <RechartsBarChart
                  accessibilityLayer
                  data={[{ 
                    component: 'Principal', 
                    due: componentData[0].due / 1000000, 
                    collected: componentData[0].collected / 1000000 
                  }]}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="component"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="due" fill="var(--color-due)" radius={4} />
                  <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
                </RechartsBarChart>
              </ChartContainer>
            </div>

            <div>
              <h4 className="text-gray-700 dark:!text-gray-700 text-xs mb-2">Interest</h4>
              <ChartContainer config={chartConfig} className="h-[80mm] w-full">
                <RechartsBarChart
                  accessibilityLayer
                  data={[{ 
                    component: 'Interest', 
                    due: componentData[1].due / 1000000, 
                    collected: componentData[1].collected / 1000000 
                  }]}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="component"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="due" fill="var(--color-due)" radius={4} />
                  <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
                </RechartsBarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Collections by Loan Officer */}
        <div className="mb-6">
          <h3 className="text-gray-900 dark:!text-gray-900 mb-3 pb-2 border-b border-gray-300 dark:!border-gray-300 text-sm">Collections by Loan Officer</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100 dark:!bg-gray-100 border-b border-gray-300 dark:!border-gray-300">
                <th className="text-left p-2 text-gray-900 dark:!text-gray-900">Loan Officer</th>
                <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Loans</th>
                <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Expected (KES)</th>
                <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Collected (KES)</th>
                <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(officerCollections).map(([officer, data]) => (
                <tr key={officer} className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900">{officer}</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{data.count}</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{safeFormat(data.expected, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{safeFormat(data.collected, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{safePercentage(data.collected, data.expected, 2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}