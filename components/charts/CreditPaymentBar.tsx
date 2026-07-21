'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

interface CreditPaymentBarProps {
  data: Array<{
    period: string;
    credit: number;
    payment: number;
  }>;
}

export default function CreditPaymentBar({ data }: CreditPaymentBarProps) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: '#FFF',
              boxShadow: 'var(--shadow-md)',
            }}
            formatter={(value: any) => [`₹ ${Number(value).toFixed(2)}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="credit" name="Credit Given (Udhar)" fill="var(--coral)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="payment" name="Payments Collected (Jama)" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
