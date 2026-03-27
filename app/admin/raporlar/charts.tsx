"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

interface DailyData {
  date: string;
  revenue: number;
  platform: number;
  markup: number;
  orders: number;
}

interface TypeBreakdown {
  type: string;
  label: string;
  count: number;
  base: number;
  platform: number;
  markup: number;
  revenue: number;
}

interface Props {
  dailyData: DailyData[];
  typeBreakdown: TypeBreakdown[];
  typeColors: Record<string, string>;
  orderTypeLabels: Record<string, string>;
}

function formatMoney(n: number) {
  return Number(n).toLocaleString("tr-TR");
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-100 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatMoney(p.value)} TL
        </p>
      ))}
    </div>
  );
};

export default function Charts({ dailyData, typeBreakdown, typeColors }: Props) {
  const pieData = typeBreakdown.map((t) => ({
    name: t.label,
    value: t.revenue,
    color: typeColors[t.type] || "#6b7280",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Daily revenue bar chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Gunluk Satis Trendi</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => <span className="text-gray-600">{value}</span>}
              />
              <Bar dataKey="platform" name="Platform" fill="#059669" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="markup" name="Acenta Kari" fill="#2563eb" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="revenue" name="Musteri Toplam" fill="#C41E3A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Hizmet Dagilimi</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={(props: any) => `${props.name ?? ""} %${((props.percent ?? 0) * 100).toFixed(0)}`}
                labelLine={{ strokeWidth: 1 }}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${formatMoney(Number(value))} TL`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
