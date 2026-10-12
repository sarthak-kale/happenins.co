import React from "react";
import { OrganizerAnalytics } from "../../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { formatRupees } from "../../lib/formatters";

interface AnalyticsChartsProps {
  analytics: OrganizerAnalytics;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Sales Velocity (Area Chart) */}
              <div className="lg:col-span-8 rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 shadow-2xl relative overflow-hidden">
                <div className="mb-6">
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                    Sales Velocity & Booking Volume
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Day-by-day aggregate ticket purchases and transaction volumes over the last 7 days.
                  </p>
                </div>
                <div className="h-72 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.salesOverTime || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e23744" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#e23744" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0c0c11", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}
                        labelStyle={{ color: "#a1a1aa", fontSize: "10px", fontWeight: "bold" }}
                        itemStyle={{ color: "#f4f4f5", fontSize: "12px" }}
                        formatter={(value, name) => [
                          name === "revenue" ? formatRupees(Number(value)) : `${value} tickets`,
                          name === "revenue" ? "Revenue" : "Tickets Sold"
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="ticketsSold"
                        stroke="#e23744"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSales)"
                        name="ticketsSold"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Check-in Ratio and Category Breakdown column */}
              <div className="lg:col-span-4 space-y-6">
                {/* Check-in Ratio */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 shadow-2xl">
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mb-2">
                    Live Security Gate Check-in Ratio
                  </h3>
                  <p className="text-[11px] text-zinc-400 mb-5 leading-relaxed">
                    Real-time attendance ratio tracking scanned tickets vs pending attendees.
                  </p>
                  
                  {analytics.checkInRatio ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-3xl font-display font-black text-white">
                          {analytics.checkInRatio.percentage}%
                        </span>
                        <span className="text-2xs font-extrabold text-[#e23744] uppercase tracking-wider">
                          {analytics.checkInRatio.checkedIn} / {analytics.checkInRatio.total} verified
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                        <div
                          className="bg-gradient-to-r from-[#e23744] to-[#ff2a54] h-full rounded-full transition-all duration-500"
                          style={{ width: `${analytics.checkInRatio.percentage}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center pt-2">
                        <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                          <span className="block text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Checked In</span>
                          <span className="text-sm font-black text-emerald-300 mt-1 block">{analytics.checkInRatio.checkedIn} guests</span>
                        </div>
                        <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/10">
                          <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-widest font-mono">Pending Passes</span>
                          <span className="text-sm font-black text-amber-300 mt-1 block">{analytics.checkInRatio.pending} tickets</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400">No active ticket check-ins recorded yet.</p>
                  )}
                </div>

                {/* Revenue breakdown by category */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 shadow-2xl">
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mb-2">
                    Revenue Report by Category
                  </h3>
                  <p className="text-[11px] text-zinc-400 mb-5 leading-relaxed">
                    Net earnings split dynamically across your active event categories.
                  </p>

                  {analytics.categoryRevenue && analytics.categoryRevenue.length > 0 ? (
                    <div className="h-44 w-full font-mono text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.categoryRevenue}
                          layout="vertical"
                          margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="#71717a" fontSize={9} tickLine={false} />
                          <YAxis dataKey="category" type="category" stroke="#71717a" fontSize={9} tickLine={false} width={80} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0c0c11", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}
                            itemStyle={{ color: "#f4f4f5", fontSize: "11px" }}
                            formatter={(value) => [formatRupees(Number(value)), "Revenue"]}
                          />
                          <Bar dataKey="revenue" fill="#e23744" radius={[0, 4, 4, 0]}>
                            {analytics.categoryRevenue.map((entry, index) => {
                              const colors = ["#e23744", "#ff2a54", "#10b981", "#f59e0b"];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 py-6 text-center">No revenue records by category found yet.</p>
                  )}
                </div>
              </div>
            </div>
  );
};
