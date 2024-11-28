import React from "react";
import { Info } from "lucide-react";

type StatsCardProps = {
  icon: React.ReactNode;
  title: string;
  info?: string;
  stats: {
    label: string;
    value: number;
    suffix?: string;
    change?: number;
  }[];
};

export function StatsCard({ icon, title, info, stats }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 hover:shadow border border-gray-200">
      <div className="flex flex-col mb-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gray-50 text-amber-600 shadow-sm">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 tracking-tight">
            {title}
          </h3>
        </div>
        {info && (
          <div className="flex items-center gap-2 mt-3 bg-blue-50 p-3 rounded-lg">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-600">{info}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
          >
            <p className="text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-900 transition-colors">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                {stat.value.toLocaleString()}
              </span>
              {stat.suffix && (
                <span className="text-xl text-amber-500 group-hover:text-amber-600">
                  {stat.suffix}
                </span>
              )}
              {stat.change !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    stat.change >= 0
                      ? "text-emerald-600 bg-emerald-50 border border-emerald-200"
                      : "text-red-600 bg-red-50 border border-red-200"
                  } px-3 py-1 rounded-full shadow-sm`}
                >
                  {stat.change >= 0 ? "↑" : "↓"} {Math.abs(stat.change)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
