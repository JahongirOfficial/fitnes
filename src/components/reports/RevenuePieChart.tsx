"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface PieDataItem {
  name: string;
  value: number;
  fill: string;
}

function PieChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[160px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.fill }} />
        <span className="text-sm font-semibold text-gray-800">{data.name}</span>
      </div>
      <p className="text-sm text-gray-600 ml-[18px]">{formatCurrency(data.value)}</p>
    </div>
  );
}

function PieChartLegend({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function RevenuePieChart({ data }: { data: PieDataItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          stroke="#fff"
          strokeWidth={2}
          cornerRadius={4}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<PieChartTooltip />} />
        <Legend content={<PieChartLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
