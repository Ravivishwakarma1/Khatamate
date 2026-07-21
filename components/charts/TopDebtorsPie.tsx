'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TopDebtorsPieProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#F43F5E', '#8B5CF6', '#F59E0B', '#00C9A7', '#3B82F6', '#EC4899'];

export default function TopDebtorsPie({ data }: TopDebtorsPieProps) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: '#FFF',
            }}
            formatter={(val: any) => [`₹ ${Number(val).toFixed(2)}`, 'Outstanding']}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
