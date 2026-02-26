"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TimePeriod } from "./actions";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  TrendingUp,
} from "lucide-react";

type Metric = {
  active_leads: { source: string; count: number }[];
  deal_pipeline: { stage: string; count: number; value: number }[];
  task_summary: {
    overdue: number;
    due_today: number;
    followups_due_today: number;
    meetings_due_today: number;
  };
  personal_task_summary?: {
    overdue: number;
    due_today: number;
    followups_due_today: number;
    meetings_due_today: number;
  };
  revenue_by_stream: {
    source: string;
    active_leads: number;
    won_deals: number;
    total_value: number;
  }[];
  personal_revenue_by_stream?: {
    source: string;
    active_leads: number;
    won_deals: number;
    total_value: number;
  }[];
  won_deals_by_industry?: { industry: string; count: number; value: number }[];
  leads_by_industry?: { industry: string; count: number }[];
  personal_won_deals_by_industry?: {
    industry: string;
    count: number;
    value: number;
  }[];
  personal_leads_by_industry?: { industry: string; count: number }[];
  team_leads: { rep_id: string; rep_name: string; leads_handled: number }[];
  personal_leads: { rep_id: string; rep_name: string; leads_handled: number };
  team_deals: {
    rep_id: string;
    rep_name: string;
    deals_closed: number;
    total_value: number;
  }[];
  personal_deals: {
    rep_id: string;
    rep_name: string;
    deals_closed: number;
    total_value: number;
  };
  team_response: {
    rep_id: string;
    rep_name: string;
    avg_response_hours: number;
  }[];
  personal_active_leads?: { source: string; count: number }[];
  personal_deal_pipeline?: { stage: string; count: number; value: number }[];
};

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardClient({
  metrics,
  userRole,
  userName,
  department,
  timePeriod: initialTimePeriod,
}: {
  metrics: Metric;
  userRole: string;
  userName: string;
  department: string;
  timePeriod: TimePeriod;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "insights" | "team">(
    "overview"
  );
  const [viewMode, setViewMode] = useState<"personal" | "manager">(
    userRole === "manager" || userRole === "admin" ? "manager" : "personal"
  );
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(initialTimePeriod);
  const [isPending, startTransition] = useTransition();

  const isManager = userRole === "manager" || userRole === "admin";
  const isB2B = department === "B2B" || userRole === "admin";

  const taskSummary: Metric["task_summary"] =
    viewMode === "personal" && metrics.personal_task_summary
      ? metrics.personal_task_summary
      : metrics.task_summary;

  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value as TimePeriod;
    setTimePeriod(newPeriod);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("time_period", newPeriod);
      router.push(`?${params.toString()}`);
    });
  };

  const activeLeadsTotal = (
    viewMode === "personal" && metrics.personal_active_leads
      ? metrics.personal_active_leads
      : metrics.active_leads
  ).reduce((s, i) => s + i.count, 0);

  const pipelineValue = (
    viewMode === "personal" && metrics.personal_deal_pipeline
      ? metrics.personal_deal_pipeline
      : metrics.deal_pipeline
  ).reduce((s, i) => s + i.value, 0);

  return (
    <div className="p-4 md:p-6">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{getGreeting()}</p>
          <h1 className="text-2xl font-bold leading-tight">
            {userName || "Dashboard"}
            {isManager && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                · {viewMode === "manager" ? "Manager View" : "Personal View"}
              </span>
            )}
          </h1>
          {isManager && viewMode === "manager" && isB2B && (
            <WorkflowHint timePeriod={timePeriod} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Period:</label>
            <select
              value={timePeriod}
              onChange={handleTimePeriodChange}
              disabled={isPending}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {TIME_PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {isManager && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">View:</label>
              <select
                value={viewMode}
                onChange={(e) =>
                  setViewMode(e.target.value as "personal" | "manager")
                }
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="personal">Personal</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── MANAGER: Team alerts strip ── */}
      {isManager && viewMode === "manager" && taskSummary.overdue > 0 && (
        <TeamAlertsStrip metrics={metrics} taskSummary={taskSummary} />
      )}

      {/* ── REP: Priority actions zone ── */}
      {viewMode === "personal" && (
        <PriorityActionsZone
          taskSummary={taskSummary}
          userName={userName}
        />
      )}

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          title="Overdue Tasks"
          value={taskSummary.overdue}
          color="text-red-400"
          glowColor="#ef4444"
          href="/tasks"
          linkLabel="View tasks →"
        />
        <KpiCard
          title="Tasks Due Today"
          value={taskSummary.due_today}
          color="text-amber-400"
          glowColor="#f59e0b"
          href="/tasks"
          linkLabel="View tasks →"
        />
        <KpiCard
          title="Active Leads"
          value={activeLeadsTotal}
          color="text-blue-400"
          glowColor="#3b82f6"
          href="/leads"
          linkLabel="View leads →"
        />
        <KpiCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          color="text-green-400"
          glowColor="#22c55e"
          href="/deals"
          linkLabel="View deals →"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-700 mb-6">
        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          Sales Overview
        </TabButton>
        {isManager && viewMode === "manager" && (
          <TabButton
            active={activeTab === "insights"}
            onClick={() => setActiveTab("insights")}
          >
            Industry Insights
          </TabButton>
        )}
        {isManager && viewMode === "manager" && (
          <TabButton
            active={activeTab === "team"}
            onClick={() => setActiveTab("team")}
          >
            Team Performance
          </TabButton>
        )}
      </div>

      {activeTab === "overview" && (
        <SalesOverview
          metrics={metrics}
          taskSummary={taskSummary}
          viewMode={viewMode}
          userName={userName}
        />
      )}
      {activeTab === "insights" && isManager && viewMode === "manager" && (
        <IndustryInsights metrics={metrics} viewMode={viewMode} />
      )}
      {activeTab === "team" && isManager && viewMode === "manager" && (
        <TeamPerformance metrics={metrics} />
      )}
    </div>
  );
}

/* ── Priority Actions Zone (rep view) ── */
function PriorityActionsZone({
  taskSummary,
  userName,
}: {
  taskSummary: Metric["task_summary"];
  userName: string;
}) {
  const hasUrgentItems =
    taskSummary.overdue > 0 ||
    taskSummary.followups_due_today > 0 ||
    taskSummary.due_today > 0;

  if (!hasUrgentItems) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400">⚡</span>
        <h2 className="text-sm font-semibold text-gray-200">
          Today's Priority Actions
        </h2>
      </div>
      <div className="space-y-2">
        {taskSummary.overdue > 0 && (
          <PriorityItem
            icon={<AlertTriangle size={14} className="text-red-400" />}
            label={`${taskSummary.overdue} overdue task${taskSummary.overdue > 1 ? "s" : ""} — needs immediate attention`}
            href="/tasks"
            urgent
          />
        )}
        {taskSummary.followups_due_today > 0 && (
          <PriorityItem
            icon={<Circle size={14} className="text-amber-400" />}
            label={`${taskSummary.followups_due_today} follow-up${taskSummary.followups_due_today > 1 ? "s" : ""} due today`}
            href="/tasks"
          />
        )}
        {taskSummary.meetings_due_today > 0 && (
          <PriorityItem
            icon={<Circle size={14} className="text-blue-400" />}
            label={`${taskSummary.meetings_due_today} meeting${taskSummary.meetings_due_today > 1 ? "s" : ""} scheduled today`}
            href="/tasks"
          />
        )}
        {taskSummary.due_today > 0 && (
          <PriorityItem
            icon={<Circle size={14} className="text-gray-400" />}
            label={`${taskSummary.due_today} task${taskSummary.due_today > 1 ? "s" : ""} due today`}
            href="/tasks"
          />
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-800 flex gap-3">
        <Link
          href="/leads?status=Warmed-Up"
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <ArrowRight size={11} /> Check leads needing follow-up
        </Link>
        <Link
          href="/prospects?status=Not+Contacted"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <ArrowRight size={11} /> Prospects not yet contacted
        </Link>
      </div>
    </div>
  );
}

function PriorityItem({
  icon,
  label,
  href,
  urgent = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        urgent
          ? "bg-red-500/8 hover:bg-red-500/15 text-red-300"
          : "hover:bg-gray-800 text-gray-300"
      }`}
    >
      {icon}
      <span>{label}</span>
      <ArrowRight size={12} className="ml-auto text-gray-600" />
    </Link>
  );
}

/* ── Team Alerts Strip (manager view) ── */
function TeamAlertsStrip({
  metrics,
  taskSummary,
}: {
  metrics: Metric;
  taskSummary: Metric["task_summary"];
}) {
  const highLoadReps = metrics.team_leads.filter((r) => r.leads_handled > 15);

  return (
    <div className="bg-red-500/6 border border-red-500/20 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              Team Alerts
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-0.5">
            {taskSummary.overdue > 0 && (
              <p>
                {taskSummary.overdue} overdue task
                {taskSummary.overdue > 1 ? "s" : ""} across the team
              </p>
            )}
            {highLoadReps.length > 0 && (
              <p>
                {highLoadReps.map((r) => r.rep_name).join(", ")}{" "}
                {highLoadReps.length === 1 ? "has" : "have"} high lead volume
              </p>
            )}
          </div>
        </div>
        <Link
          href="/activity"
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 border border-red-500/30 px-3 py-1.5 rounded-lg"
        >
          Review <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

/* ── Sales Overview ── */
function SalesOverview({
  metrics,
  taskSummary,
  viewMode,
  userName,
}: {
  metrics: Metric;
  taskSummary: Metric["task_summary"];
  viewMode: "personal" | "manager";
  userName: string;
}) {
  const activeLeadsData =
    viewMode === "personal" && metrics.personal_active_leads
      ? metrics.personal_active_leads
      : metrics.active_leads;

  const dealPipelineData =
    viewMode === "personal" && metrics.personal_deal_pipeline
      ? metrics.personal_deal_pipeline
      : metrics.deal_pipeline;

  const revenueStreamData =
    viewMode === "personal" && metrics.personal_revenue_by_stream
      ? metrics.personal_revenue_by_stream
      : metrics.revenue_by_stream;

  const leadData = activeLeadsData.map((item) => ({
    name: item.source,
    leads: item.count,
  }));

  const dealData = dealPipelineData.map((item) => ({
    name: item.stage,
    deals: item.count,
    value: item.value,
  }));

  const revenueData = revenueStreamData.map((item) => ({
    name: item.source,
    value: item.total_value,
  }));

  return (
    <>
      {viewMode === "personal" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard
            title="Name"
            value={metrics.personal_deals?.rep_name || userName}
            color="text-gray-200"
          />
          <KpiCard
            title="Leads Handled"
            value={metrics.personal_leads?.leads_handled || 0}
            color="text-green-400"
          />
          <KpiCard
            title="Deals Closed"
            value={metrics.personal_deals?.deals_closed || 0}
            color="text-green-400"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={
            viewMode === "personal"
              ? "My Active Leads by Source"
              : "Active Leads by Source"
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="leads" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={viewMode === "personal" ? "My Deal Pipeline" : "Deal Pipeline"}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dealData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="name"
                stroke="#999"
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis yAxisId="left" stroke="#999" />
              <YAxis yAxisId="right" orientation="right" stroke="#999" />
              <Tooltip
                formatter={(value, name) =>
                  name === "value"
                    ? [`$${Number(value).toLocaleString()}`, "Value"]
                    : [value, "Deals"]
                }
              />
              <Bar
                yAxisId="left"
                dataKey="deals"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="value"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={
            viewMode === "personal"
              ? "My Revenue by Stream"
              : "Revenue by Stream"
          }
        >
          {revenueData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${!!percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-8">No revenue data</p>
          )}
        </ChartCard>

        <ChartCard
          title={viewMode === "personal" ? "My Lead Status" : "Lead Status"}
        >
          <div className="space-y-3">
            {activeLeadsData.map((item) => (
              <div key={item.source}>
                <div className="flex justify-between text-sm">
                  <span>{item.source}</span>
                  <span>{item.count}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (item.count /
                          Math.max(...activeLeadsData.map((x) => x.count), 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}

/* ── Industry Insights ── */
function IndustryInsights({
  metrics,
  viewMode,
}: {
  metrics: Metric;
  viewMode: "personal" | "manager";
}) {
  const wonDealsData =
    viewMode === "personal" && metrics.personal_won_deals_by_industry
      ? metrics.personal_won_deals_by_industry.map((item) => ({
          name: item.industry,
          deals: item.count,
          value: item.value,
        }))
      : metrics.won_deals_by_industry?.map((item) => ({
          name: item.industry,
          deals: item.count,
          value: item.value,
        })) || [];

  const leadsByIndustry =
    viewMode === "personal" && metrics.personal_leads_by_industry
      ? metrics.personal_leads_by_industry.map((item) => ({
          name: item.industry,
          leads: item.count,
        }))
      : metrics.leads_by_industry?.map((item) => ({
          name: item.industry,
          leads: item.count,
        })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard
        title={
          viewMode === "personal"
            ? "My Won Deals by Industry"
            : "Won Deals by Industry"
        }
      >
        {wonDealsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wonDealsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="name"
                stroke="#999"
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis yAxisId="left" stroke="#999" />
              <YAxis yAxisId="right" orientation="right" stroke="#999" />
              <Tooltip
                formatter={(value, name) =>
                  name === "value"
                    ? [`$${Number(value).toLocaleString()}`, "Value"]
                    : [value, "Deals"]
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="deals"
                name="Deals"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="value"
                name="Value ($)"
                fill="#ec4899"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-8">No won deals data</p>
        )}
      </ChartCard>

      <ChartCard
        title={
          viewMode === "personal" ? "My Leads by Industry" : "Leads by Industry"
        }
      >
        {leadsByIndustry.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadsByIndustry}
                cx="50%"
                cy="50%"
                labelLine
                outerRadius={80}
                fill="#8884d8"
                dataKey="leads"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name}: ${!!percent ? (percent * 100).toFixed(0) : 0}%`
                }
              >
                {leadsByIndustry.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Leads"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-8">No leads data</p>
        )}
      </ChartCard>
    </div>
  );
}

/* ── Team Performance ── */
function TeamPerformance({ metrics }: { metrics: Metric }) {
  const repMap = new Map<string, any>();

  metrics.team_leads.forEach((rep) => {
    repMap.set(rep.rep_id, {
      rep_id: rep.rep_id,
      rep_name: rep.rep_name,
      leads_handled: rep.leads_handled,
      deals_closed: 0,
      total_value: 0,
      avg_response_hours: 0,
    });
  });

  metrics.team_deals.forEach((rep) => {
    if (repMap.has(rep.rep_id)) {
      const existing = repMap.get(rep.rep_id);
      repMap.set(rep.rep_id, {
        ...existing,
        deals_closed: rep.deals_closed,
        total_value: rep.total_value,
      });
    }
  });

  metrics.team_response.forEach((rep) => {
    if (repMap.has(rep.rep_id)) {
      const existing = repMap.get(rep.rep_id);
      repMap.set(rep.rep_id, {
        ...existing,
        avg_response_hours: rep.avg_response_hours,
      });
    }
  });

  const teamData = Array.from(repMap.values());

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rep
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Leads Handled
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Deals Closed
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Pipeline Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {teamData.length > 0 ? (
              teamData.map((rep) => (
                <tr key={rep.rep_id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                    {rep.rep_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-300">
                    {rep.leads_handled}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-300">
                    {rep.deals_closed}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-300">
                    ${rep.total_value.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No team performance data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Reusable Components ── */
function KpiCard({
  title,
  value,
  color,
  glowColor,
  href,
  linkLabel,
}: {
  title: string;
  value: string | number;
  color: string;
  glowColor?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 relative overflow-hidden">
      {glowColor && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: glowColor }}
        />
      )}
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
      {href && linkLabel && (
        <Link
          href={href}
          className="mt-2 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
      <h2 className="text-base font-semibold mb-4 text-gray-200">{title}</h2>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium cursor-pointer text-sm ${
        active
          ? "text-blue-400 border-b-2 border-blue-400"
          : "text-gray-400 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Workflow Hint for B2B Managers ── */
function WorkflowHint({ timePeriod }: { timePeriod: TimePeriod }) {
  if (timePeriod === "weekly") {
    return (
      <div className="mt-3 bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 max-w-2xl">
        <p className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
          <span>📋</span> Weekly Pipeline Review Workflow
        </p>
        <ol className="text-xs text-gray-300 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Review KPIs above and check <Link href="/dashboard?time_period=weekly" className="text-blue-400 hover:underline font-medium">Industry Insights</Link> tab for top-performing industries</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Check <Link href="/dashboard?time_period=weekly" className="text-blue-400 hover:underline font-medium">Team Performance</Link> tab to identify reps needing support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Review <Link href="/activity" className="text-blue-400 hover:underline font-medium">Activity Log</Link> for team engagement (last 7 days)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Check <Link href="/tasks" className="text-blue-400 hover:underline font-medium">Tasks</Link> for overdue items and team workload</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">5.</span>
            <span>Review <Link href="/leads" className="text-blue-400 hover:underline font-medium">Leads</Link> distribution and reassign if needed</span>
          </li>
        </ol>
      </div>
    );
  }

  if (timePeriod === "monthly") {
    return (
      <div className="mt-3 bg-green-900/20 border border-green-800/30 rounded-lg p-3 max-w-2xl">
        <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1.5">
          <span>🎯</span> Monthly Strategy & ICP Optimization Workflow
        </p>
        <ol className="text-xs text-gray-300 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">1.</span>
            <span>Review monthly metrics: conversion rates, revenue by stream</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">2.</span>
            <span>Analyze <Link href="/intended-customer-profiles" className="text-green-400 hover:underline font-medium">ICPs</Link> to identify high-performing segments</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">3.</span>
            <span>Review <Link href="/prospects" className="text-green-400 hover:underline font-medium">Prospects</Link> by ICP tag to assess quality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">4.</span>
            <span>Check <Link href="/leads" className="text-green-400 hover:underline font-medium">Leads</Link> source performance on dashboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">5.</span>
            <span>Adjust ICP targeting and communicate changes to team</span>
          </li>
        </ol>
      </div>
    );
  }

  if (timePeriod === "quarterly") {
    return (
      <div className="mt-3 bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 max-w-2xl">
        <p className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
          <span>📊</span> Quarterly Business Review Prep Workflow
        </p>
        <ol className="text-xs text-gray-300 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">1.</span>
            <span>Capture screenshots of all quarterly metrics and charts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">2.</span>
            <span>Compare to previous quarters and calculate growth rates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">3.</span>
            <span>Export <Link href="/activity" className="text-purple-400 hover:underline font-medium">Activity</Link> data for team performance summary</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">4.</span>
            <span>Review <Link href="/deals" className="text-purple-400 hover:underline font-medium">Deals</Link> pipeline and calculate velocity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">5.</span>
            <span>Project next quarter's revenue and identify gaps</span>
          </li>
        </ol>
      </div>
    );
  }

  return null;
}
