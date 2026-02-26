"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  Plus,
  ArrowUpRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Prospect, Owner, IntendedCustomerProfile } from "./types";
import Link from "next/link";
import Select from "react-select";
import { components } from "react-select";
import { fetchProspects } from "./actions";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 20;

const ALLOWED_STATUSES = [
  "Not Contacted",
  "Not Qualified",
  "Pre-Qualified",
  "Lost Lead",
  "Junk Lead",
  "Contacted",
  "Contacted in Future",
  "Attempted to Contact",
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Not Contacted": { bg: "bg-gray-700/50", text: "text-gray-300" },
  "Not Qualified": { bg: "bg-yellow-900/30", text: "text-yellow-400" },
  "Pre-Qualified": { bg: "bg-green-900/30", text: "text-green-400" },
  "Lost Lead": { bg: "bg-red-900/30", text: "text-red-400" },
  "Junk Lead": { bg: "bg-red-900/30", text: "text-red-400" },
  Contacted: { bg: "bg-blue-900/30", text: "text-blue-400" },
  "Contacted in Future": { bg: "bg-purple-900/30", text: "text-purple-400" },
  "Attempted to Contact": { bg: "bg-orange-900/30", text: "text-orange-400" },
};

// Helper functions for localStorage
const getPendingUpdates = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("pendingProspectStatusUpdates");
  return stored ? JSON.parse(stored) : {};
};

const setPendingUpdates = (updates: Record<string, string>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "pendingProspectStatusUpdates",
    JSON.stringify(updates),
  );
};

const clearPendingUpdates = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pendingProspectStatusUpdates");
};

export default function ProspectsClient({
  initialData,
}: {
  initialData: {
    prospects: Prospect[];
    owners: Array<Owner & { value: string; label: string }> | null;
    icps: Array<IntendedCustomerProfile & { value: string; label: string }> | null;
    count: number;
  };
}) {
  const [prospects, setProspects] = useState<{
    prospects: Prospect[];
    count: number;
  }>({
    prospects: initialData.prospects || [],
    count: initialData.count || 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<Array<string>>([]);
  const [icpFilter, setIcpFilter] = useState<Array<string>>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [jobTitleFilter, setJobTitleFilter] = useState<string>("");
  const [zipCodeFilter, setZipCodeFilter] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(
    new Set(),
  );
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionStatus, setBulkActionStatus] = useState<string | null>(null);
  const [pendingUpdates, setPendingUpdatesState] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  const firstLoad = useRef(true);
  const supabaseClient = createClient();

  useEffect(() => {
    setPendingUpdatesState(getPendingUpdates());
  }, []);

  const CustomIcpOption = (props: any) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2 border border-gray-300"
            style={{ backgroundColor: data.tag_color }}
          />
          <span className="text-black">{data.label}</span>
        </div>
      </components.Option>
    );
  };

  const CustomSingleValue = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center">
          <span className="text-black">{props.data.label}</span>
        </div>
      </components.Option>
    );
  };

  const toggleProspectSelection = (id: string) => {
    const newSelected = new Set(selectedProspects);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProspects(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedProspects.size === prospects.prospects.length) {
      setSelectedProspects(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(prospects.prospects.map((p) => p.id));
      setSelectedProspects(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkConvertToLeads = async () => {
    if (selectedProspects.size === 0) return;
    const prospectIds = Array.from(selectedProspects);
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (!session) {
      alert("Not authenticated");
      return;
    }
    const { data, error } = await supabaseClient.functions.invoke(
      "bulk-convert-to-leads",
      { body: { prospectIds } },
    );
    if (error) {
      alert(error);
    }
    alert("Lead conversion queued, check back in a while on the leads page");
    return data;
  };

  const bulkUpdateProspectStatus = async (
    prospectIds: string[],
    status: string,
  ) => {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (!session) return;
    const { data, error } = await supabaseClient.functions.invoke(
      "bulk-update-prospect-status",
      { body: { prospectIds, status } },
    );
    if (error) {
      const updatedPending = { ...pendingUpdates };
      prospectIds.forEach((id) => {
        if (updatedPending[id]) delete updatedPending[id];
      });
      setPendingUpdatesState(updatedPending);
      setPendingUpdates(updatedPending);
      if (Object.keys(updatedPending).length === 0) {
        clearPendingUpdates();
      } else {
        setPendingUpdates(updatedPending);
      }
      alert(error);
    }
    return data;
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedProspects.size === 0 || !bulkActionStatus) return;
    const prospectIds = Array.from(selectedProspects);
    const updates = { ...pendingUpdates };
    prospectIds.forEach((id) => {
      updates[id] = bulkActionStatus!;
    });
    setPendingUpdates(updates);
    setPendingUpdatesState(updates);
    alert(
      `Updating ${selectedProspects.size} prospects to status: ${bulkActionStatus}`,
    );
    setSelectedProspects(new Set());
    setShowBulkActions(false);
    setBulkActionStatus(null);
    bulkUpdateProspectStatus(prospectIds, bulkActionStatus);
  };

  const refreshProspects = async () => {
    setLoading(true);
    try {
      const { prospects, count } = await fetchProspects(
        search,
        ownerFilter,
        icpFilter,
        PAGE_SIZE,
        currentPage,
      );
      setProspects({ prospects, count });
      const updatedPending = { ...pendingUpdates };
      let hasChanges = false;
      prospects.forEach((prospect) => {
        if (
          updatedPending[prospect.id] &&
          updatedPending[prospect.id] === prospect.status
        ) {
          delete updatedPending[prospect.id];
          hasChanges = true;
        }
      });
      if (hasChanges) {
        setPendingUpdatesState(updatedPending);
        setPendingUpdates(updatedPending);
        if (Object.keys(updatedPending).length === 0) {
          clearPendingUpdates();
        } else {
          setPendingUpdates(updatedPending);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!firstLoad.current) {
      (async function () {
        const { prospects, count } = await fetchProspects(
          search,
          ownerFilter,
          icpFilter,
          PAGE_SIZE,
          currentPage,
          companyFilter,
          cityFilter,
          stateFilter,
          jobTitleFilter,
          zipCodeFilter,
        );
        setProspects({ prospects, count });
        const updatedPending = { ...pendingUpdates };
        let hasChanges = false;
        prospects.forEach((prospect) => {
          if (
            updatedPending[prospect.id] &&
            updatedPending[prospect.id] === prospect.status
          ) {
            delete updatedPending[prospect.id];
            hasChanges = true;
          }
        });
        if (hasChanges) {
          setPendingUpdatesState(updatedPending);
          setPendingUpdates(updatedPending);
          if (Object.keys(updatedPending).length === 0) {
            clearPendingUpdates();
          } else {
            setPendingUpdates(updatedPending);
          }
        }
      })();
    }
    firstLoad.current = false;
  }, [
    search,
    ownerFilter,
    icpFilter,
    currentPage,
    companyFilter,
    cityFilter,
    stateFilter,
    jobTitleFilter,
    zipCodeFilter,
  ]);

  const totalPages = Math.ceil(prospects.count / PAGE_SIZE);

  const hasAdvancedFilters =
    companyFilter || cityFilter || stateFilter || jobTitleFilter || zipCodeFilter;

  const hasAnyFilter =
    search ||
    ownerFilter.length > 0 ||
    icpFilter.length > 0 ||
    statusFilter ||
    !!hasAdvancedFilters;

  const clearAllFilters = () => {
    setSearch("");
    setOwnerFilter([]);
    setIcpFilter([]);
    setStatusFilter(null);
    setCompanyFilter("");
    setCityFilter("");
    setStateFilter("");
    setJobTitleFilter("");
    setZipCodeFilter("");
  };

  // Count prospects per status from current data
  const statusCounts = ALLOWED_STATUSES.reduce(
    (acc, s) => {
      acc[s] = prospects.prospects.filter((p) => p.status === s).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Filter visible prospects by status chip
  const visibleProspects = statusFilter
    ? prospects.prospects.filter((p) => p.status === statusFilter)
    : prospects.prospects;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const StatusBadge = ({
    status,
    prospectId,
  }: {
    status: string;
    prospectId: string;
  }) => {
    const pendingStatus = pendingUpdates[prospectId];
    const displayStatus = pendingStatus
      ? `${status} → ${pendingStatus} (pending)`
      : status;
    const colors = STATUS_COLORS[status] || {
      bg: "bg-gray-700/50",
      text: "text-gray-300",
    };
    const finalBg = pendingStatus
      ? "bg-yellow-900/30 text-yellow-400"
      : `${colors.bg} ${colors.text}`;
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${finalBg}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs text-blue-400 font-medium font-mono uppercase tracking-wider mb-0.5">
            Pipeline · Step 2
          </p>
          <h1 className="text-2xl font-bold">
            Prospects{" "}
            <span className="text-base font-normal text-gray-500">
              {prospects.count} total
            </span>
          </h1>
          <div className="mt-2 bg-green-900/20 border border-green-800/30 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-green-400 mb-1.5 flex items-center gap-1.5">
              <span>🎯</span> Monthly Workflow: Prospect Quality Review
            </p>
            <ol className="text-xs text-gray-300 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">1.</span>
                <span>Use <span className="text-green-300 font-medium">ICP Tag</span> filter to view prospects by each ICP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">2.</span>
                <span>Use <span className="text-green-300 font-medium">More filters</span> to identify patterns (company, job title, location)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">3.</span>
                <span>Review conversion rate from prospect to lead by ICP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">4.</span>
                <span>Cross-reference with <Link href="/intended-customer-profiles" className="text-green-400 hover:underline font-medium">ICPs</Link> performance</span>
              </li>
            </ol>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/prospects/import")}
            className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            <Download size={14} />
            Import
          </button>
          <button
            onClick={() => router.push("/prospects/new")}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={14} />
            New Prospect
          </button>
        </div>
      </div>

      {/* ── Primary filters row ── */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search name or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-52"
          />
        </div>

        <div className="w-44">
          <Select
            options={initialData.owners || []}
            value={initialData.owners?.filter((o) =>
              ownerFilter.includes(o.id),
            )}
            onChange={(selected) =>
              setOwnerFilter(selected?.map((o) => o.value) || [])
            }
            placeholder="Owner"
            components={{ Option: CustomSingleValue }}
            isMulti
          />
        </div>

        <div className="w-44">
          <Select
            options={initialData.icps || []}
            value={initialData.icps?.filter((icp) =>
              icpFilter.includes(icp.value),
            )}
            onChange={(selected) =>
              setIcpFilter(selected?.map((icp) => icp.value) || [])
            }
            placeholder="ICP Tag"
            components={{ Option: CustomIcpOption }}
            isMulti
          />
        </div>

        <button
          onClick={refreshProspects}
          disabled={loading}
          className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-400 px-3 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Refresh
        </button>

        <button
          onClick={() => setShowAdvancedFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
            showAdvancedFilters || hasAdvancedFilters
              ? "bg-blue-900/30 border-blue-700/50 text-blue-400"
              : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {showAdvancedFilters ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
          More filters
          {hasAdvancedFilters && (
            <span className="bg-blue-500 text-white text-[9px] font-bold px-1 rounded-full ml-0.5">
              ●
            </span>
          )}
        </button>

        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Advanced filters (collapsible) ── */}
      {showAdvancedFilters && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Company
            </label>
            <input
              type="text"
              placeholder="e.g. Acme, Tech Corp"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. CEO, Manager"
              value={jobTitleFilter}
              onChange={(e) => setJobTitleFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="e.g. New York, LA"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              State
            </label>
            <input
              type="text"
              placeholder="e.g. CA, NY"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              placeholder="e.g. 10001, 90210"
              value={zipCodeFilter}
              onChange={(e) => setZipCodeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* ── Status filter chips ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setStatusFilter(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            !statusFilter
              ? "bg-gray-700 border-gray-600 text-gray-200"
              : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400"
          }`}
        >
          All
          <span className="font-mono bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded-full text-[10px]">
            {prospects.count}
          </span>
        </button>
        {ALLOWED_STATUSES.filter(
          (s) =>
            prospects.prospects.some((p) => p.status === s) ||
            statusFilter === s,
        ).map((status) => {
          const colors = STATUS_COLORS[status] || {
            bg: "bg-gray-700/50",
            text: "text-gray-300",
          };
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(isActive ? null : status)
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? `${colors.bg} ${colors.text} border-current/30`
                  : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400"
              }`}
            >
              {status}
              <span
                className={`font-mono px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-black/20" : "bg-gray-700 text-gray-400"
                }`}
              >
                {statusCounts[status] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Results count ── */}
      <div className="mb-3 text-xs text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-300">
          {visibleProspects.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-300">{prospects.count}</span>{" "}
        prospects
      </div>

      {/* ── Table ── */}
      {visibleProspects.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No prospects found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedProspects.size === visibleProspects.length &&
                      visibleProspects.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded accent-blue-500"
                  />
                </th>
                {[
                  "Name",
                  "ICP Tag",
                  "Status",
                  "Owner",
                  "Company",
                  "Title",
                  "Phone",
                  "Email",
                  "City",
                  "State",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700/50">
              {visibleProspects.map((prospect) => (
                <tr
                  key={prospect.id}
                  className={`hover:bg-gray-750 transition-colors ${
                    selectedProspects.has(prospect.id) ? "bg-blue-900/20" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProspects.has(prospect.id)}
                      onChange={() => toggleProspectSelection(prospect.id)}
                      className="rounded accent-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-200">
                    {prospect.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-transparent"
                      style={{
                        backgroundColor: prospect.tagged_icp.tag_color + "22",
                        color: prospect.tagged_icp.tag_color,
                        borderColor: prospect.tagged_icp.tag_color + "44",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: prospect.tagged_icp.tag_color }}
                      />
                      {prospect.tagged_icp.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge
                      status={prospect.status}
                      prospectId={prospect.id}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {prospect.owner.full_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {prospect.company || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                    {prospect.job_title || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                    {prospect.phone || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                    {prospect.email || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                    {prospect.city || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                    {prospect.state || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {prospect.created_at}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/prospects/${prospect.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-900/30 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/prospects/${prospect.id}/edit`}
                        className="text-xs text-gray-400 hover:text-gray-200 font-medium px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/leads/new?prospect_id=${prospect.id}`}
                        className="text-xs font-semibold text-white bg-green-700 hover:bg-green-600 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                      >
                        <ArrowUpRight size={11} /> Convert
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Floating bulk actions bar ── */}
      {showBulkActions && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 border border-gray-700 shadow-2xl rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-blue-400">
            {selectedProspects.size} selected
          </span>
          <div className="w-px h-4 bg-gray-700" />
          <button
            onClick={handleBulkConvertToLeads}
            className="flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <ArrowUpRight size={14} />
            Convert to Leads
          </button>
          <div className="flex items-center gap-2">
            <select
              value={bulkActionStatus || ""}
              onChange={(e) => setBulkActionStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200"
            >
              <option value="">Update Status…</option>
              {ALLOWED_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkUpdateStatus}
              disabled={!bulkActionStatus}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                bulkActionStatus
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              Apply
            </button>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <button
            onClick={() => {
              setSelectedProspects(new Set());
              setShowBulkActions(false);
            }}
            className="text-gray-500 hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
