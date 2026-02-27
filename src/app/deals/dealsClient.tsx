"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  Filter,
  Briefcase,
  Tag,
  User,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { fetchDeals } from "./actions";
import { Deal, Owner } from "./types";

const PAGE_SIZE = 20;
const STAGE_OPTIONS = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];
const SOURCE_OPTIONS = [
  "Upwork",
  "Freelancer",
  "Recruitment",
  "B2B",
  "Referral",
];

export default function DealsClient({
  initialData,
  role,
}: {
  initialData: {
    deals: Deal[];
    count: number;
    owners: Owner[];
  };
  role: string;
}) {
  const [deals, setDeals] = useState({
    deals: initialData.deals,
    count: initialData.count,
  });
  const owners = initialData.owners;
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!firstLoad.current) {
      (async () => {
        setLoading(true);
        const result = await fetchDeals(
          search,
          stageFilter,
          sourceFilter,
          ownerFilter,
          PAGE_SIZE,
          currentPage,
        );

        setDeals(result as unknown as { deals: Deal[]; count: number });
        setLoading(false);
      })();
    }
    firstLoad.current = false;
  }, [search, stageFilter, sourceFilter, ownerFilter, currentPage]);

  const totalPages = Math.ceil(deals.count / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, sourceFilter, ownerFilter]);

  const StageBadge = ({ stage }: { stage: string }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      Prospecting: { bg: "bg-gray-700/50", text: "text-gray-300" },
      Qualification: { bg: "bg-blue-900/30", text: "text-blue-400" },
      Proposal: { bg: "bg-purple-900/30", text: "text-purple-400" },
      Negotiation: { bg: "bg-orange-900/30", text: "text-orange-400" },
      Won: { bg: "bg-green-900/30", text: "text-green-400" },
      Lost: { bg: "bg-red-900/30", text: "text-red-400" },
    };
    const colors = colorMap[stage] || { bg: "bg-gray-700/50", text: "text-gray-300" };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors.bg} ${colors.text}`}>
        {stage}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs text-green-400 font-medium font-mono uppercase tracking-wider mb-0.5">
            Pipeline · Step 4
          </p>
          <h1 className="text-2xl font-bold">
            Deals{" "}
            <span className="text-base font-normal text-gray-500">
              {deals.count} total
            </span>
          </h1>
          {role === "sales_rep" ? (
            <div className="mt-2 bg-amber-900/20 border border-amber-800/30 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                <span>💰</span> Daily Workflow: Deal Progression
              </p>
              <ol className="text-xs text-gray-300 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>Filter by <span className="text-amber-300 font-medium">Owner</span> (your name) and active stages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>Click "View" to review deal details and associated lead</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>Identify next steps: schedule meeting, send proposal, follow up</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">4.</span>
                  <span>Update deal stage when appropriate after customer action</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">5.</span>
                  <span>Create tasks for each deal to track your next actions</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="mt-2 bg-blue-900/20 border border-blue-800/30 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center gap-1.5">
                <span>📊</span> Weekly Workflow: Deal Pipeline Review
              </p>
              <ol className="text-xs text-gray-300 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Review deals by stage and identify stalled opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Check deal velocity and time in each stage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>Help reps remove blockers on high-value deals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Forecast monthly/quarterly revenue based on pipeline</span>
                </li>
              </ol>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/deals/import")}
            className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            <Download size={14} />
            Import
          </button>
          <button
            onClick={() => router.push("/deals/new")}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={14} />
            New Deal
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search deal or lead…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500 w-52"
          />
        </div>

        <div className="w-44">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-green-500"
          >
            <option value="all">All Stages</option>
            {STAGE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="w-44">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-green-500"
          >
            <option value="all">All Sources</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="w-44">
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-green-500"
          >
            <option value="all">All Owners</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.full_name}
              </option>
            ))}
          </select>
        </div>

        {(search ||
          stageFilter !== "all" ||
          sourceFilter !== "all" ||
          ownerFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setStageFilter("all");
              setSourceFilter("all");
              setOwnerFilter("all");
            }}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-400">
        Showing <strong>{deals.deals.length}</strong> of{" "}
        <strong>{deals.count}</strong> deals
      </div>

      {/* Table */}
      {deals.deals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No deals found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Deal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Close Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {deals.deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-200">{deal.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deal.lead_id && deal.lead_name ? (
                      <Link
                        href={`/leads/${deal.lead_id}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {deal.lead_name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Standalone</span>
                    )}
                    {deal.lead_company && (
                      <div className="text-sm text-gray-500">
                        {deal.lead_company}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StageBadge stage={deal.stage} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {deal.value ? `$${deal.value.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {deal.owner_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {deal.close_date || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
