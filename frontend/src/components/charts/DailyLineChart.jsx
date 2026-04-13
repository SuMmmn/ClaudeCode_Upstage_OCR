import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const fmt = (v) =>
  new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(v)

const fmtFull = (v) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(v)

// YYYY-MM-DD → MM/DD
const shortDate = (d) => d?.slice(5).replace('-', '/')

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-blue-600">{fmtFull(payload[0].value)}</p>
    </div>
  )
}

export default function DailyLineChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        데이터가 없습니다.
      </div>
    )
  }

  const displayData = data.map((d) => ({ ...d, label: shortDate(d.date) }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={displayData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#2563EB"
          strokeWidth={2}
          dot={{ r: 3, fill: '#2563EB' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
