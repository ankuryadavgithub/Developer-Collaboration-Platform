import React from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

const repositoryHealthData = [
  {
    title: "Code Coverage",
    value: "92%",
    type: "progress",
    progress: 92,
    color: "bg-green-500",
  },
  {
    title: "Test Passing Rate",
    value: "98%",
    type: "progress",
    progress: 98,
    color: "bg-green-500",
  },
  {
    title: "Open Issues",
    value: "18",
    type: "chart",
    chartColor: "#ef4444",
  },
  {
    title: "Technical Debt",
    value: "4.2 hrs",
    type: "chart",
    chartColor: "#f97316",
  },
  {
    title: "Code Smells",
    value: "12",
    type: "chart",
    chartColor: "#a855f7",
  },
  {
    title: "Duplications",
    value: "3.1%",
    type: "chart",
    chartColor: "#3b82f6",
  },
];

const chartData = [
  { value: 20 },
  { value: 35 },
  { value: 28 },
  { value: 45 },
  { value: 30 },
  { value: 55 },
  { value: 48 },
];

const HealthMetric = ({ title, value, type, progress, color, chartColor }) => {
  return (
    <div className="px-4 py-4 bg-[#111827] min-w-0 flex flex-col justify-between">
      {/* Title */}
      <h4 className="text-sm text-slate-400 mb-2 truncate">{title}</h4>

      {/* Value */}
      <p className="text-3xl font-semibold text-slate-100 mb-4">{value}</p>

      {/* Progress Bars */}
      {type === "progress" ? (
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : (
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const RepositoryHealth = () => {
  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-slate-100">
          Repository Health
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-slate-800">
        {repositoryHealthData.map((item) => (
          <HealthMetric key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
};

export default RepositoryHealth;
