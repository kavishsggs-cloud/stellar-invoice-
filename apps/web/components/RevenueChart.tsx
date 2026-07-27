"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Invoice, InvoiceStatus } from "@repo/sdk";

export default function RevenueChart({ invoices }: { invoices: Invoice[] }) {
  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data[dateStr] = 0;
    }

    invoices.forEach(inv => {
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
    <div className="h-[280px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#08B5E5" stopOpacity={0.45} />
              <stop offset="50%" stopColor="#14D9C4" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#08B5E5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            stroke="#70839B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#70839B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#132238', 
              borderColor: 'rgba(255,255,255,0.12)', 
              borderRadius: '16px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)' 
            }}
            itemStyle={{ color: '#08B5E5', fontWeight: 700, fontSize: '13px' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${Number(value).toFixed(2)} XLM`, 'Settled Revenue']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#08B5E5"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenueGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
