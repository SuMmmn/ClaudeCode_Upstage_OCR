import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORY_CHART_COLORS } from '../../constants/categories'

const fmtFull = (v) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(v)

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { category, amount, ratio } = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-700">{category}</p>
      <p className="text-gray-600">{fmtFull(amount)}</p>
      <p className="text-gray-400">{ratio}%</p>
    </div>
  )
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, ratio }) {
  if (ratio < 5) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {ratio}%
    </text>
  )
}

export default function CategoryPieChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((entry) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_CHART_COLORS[entry.category] ?? '#9CA3AF'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
