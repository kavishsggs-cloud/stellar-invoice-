"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Invoice, InvoiceStatus } from "@repo/sdk";

export default function RevenueChart({ invoices }: { invoices: Invoice[] }) {
  const chartData = useMemo(() => {
    // Generate last 7 days data
    const data: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data[dateStr] = 0;
    }

    invoices.forEach(inv => {
      // Only count paid invoices for revenue
      if (inv.status === InvoiceStatus.Paid) {
        const d = new Date(Number(inv.updatedAt));
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (data[dateStr] !== undefined) {
          data[dateStr] += Number(inv.amount) / 10000000;
        }
      }
    });

    return Object.keys(data).map(key => ({
      date: key,
      amount: data[key]
    }));
  }, [invoices]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="date" 
            stroke="#52525b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#52525b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#3b82f6' }}
            formatter={(value: any) => [`${Number(value).toFixed(2)} XLM`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
