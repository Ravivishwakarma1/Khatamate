'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface OutstandingTrendProps {
  data: Array<{
    date: string;
    outstanding: number;
  }>;
}

export default function OutstandingTrend({ data }: OutstandingTrendProps) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--coral)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--coral)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: '#FFF',
            }}
            formatter={(value: any) => [`₹ ${Number(value).toFixed(2)}`, 'Total Outstanding']}
          />
          <Area
            type="monotone"
            dataKey="outstanding"
            stroke="var(--coral)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorOutstanding)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
