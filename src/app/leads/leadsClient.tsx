"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  Plus,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
} from "lucide-react";
import { Lead, Owner, IntendedCustomerProfile } from "./types";
import Link from "next/link";
import Select from "react-select";
import { components } from "react-select";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "Warmed-Up", label: "Warmed-Up" },
  { value: "Negotiating", label: "Negotiating" },
  { value: "Service Initiated", label: "Service Initiated" },
  { value: "Service Declined", label: "Service Declined" },
];

const SOURCE_OPTIONS = [
  { value: "Upwork", label: "Upwork" },
  { value: "Freelancer", label: "Freelancer" },
  { value: "Recruitment", label: "Recruitment" },
  { value: "B2B", label: "B2B" },
  { value: "Referral", label: "Referral" },
];

// Statuses where "Create Deal" CTA makes sense
const DEAL_READY_STATUSES = ["Warmed-Up", "Negotiating"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Warmed-Up": { bg: "bg-blue-900/30", text: "text-blue-400" },
  Negotiating: { bg: "bg-orange-900/30", text: "text-orange-400" },
  "Service Initiated": { bg: "bg-green-900/30", text: "text-green-400" },
  "Service Declined": { bg: "bg-red-900/30", text: "text-red-400" },
  Interview: { bg: "bg-purple-900/30", text: "text-purple-400" },
  "Change Pending": { bg: "bg-yellow-900/30", text: "text-yellow-400" },
};

const getPendingUpdates = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("pendingLeadStatusUpdates");
  return stored ? JSON.parse(stored) : {};
};

const setPendingUpdates = (updates: Record<string, string>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("pendingLeadStatusUpdates", JSON.stringify(updates));
};

const clearPendingUpdates = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pendingLeadStatusUpdates");
};

export default function LeadsClient({
  fetchLeads,
  initialData,
}: {
  fetchLeads: (
    search?: string | null,
    statusFilter?: string[] | null,
    sourceFilter?: string[] | null,
    ownerFilter?: string[] | null,
    companyFilter?: string | null,
    icpFilter?: string[] | null,
    cityFilter?: string | null,
    stateFilter?: string | null,
    jobTitleFilter?: string | null,
    zipCodeFilter?: string | null,
    pageSize?: number,
    currentPage?: number,
  ) => Promise<{ leads: Lead[]; count: number }>;
  initialData: {
    leads: Lead[];
    owners: Owner[] | null;
    icps: Array<{ value: string; label: string; tag_color: string }> | null;
    count: number;
  };
}) {
  const [leads, setLeads] = useState<{ leads: Lead[]; count: number }>({
    leads: initialData.leads || [],
    count: initialData.count || 0,
  });
  const owners: Owner[] = initialData.owners || [];
  const icps = initialData.icps || [];
  const ownerOptions = owners.map((o) => ({ value: o.id, label: o.full_name }));

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [statusChip, setStatusChip] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [icpFilter, setIcpFilter] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [jobTitleFilter, setJobTitleFilter] = useState<string>("");
  const [zipCodeFilter, setZipCodeFilter] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionStatus, setBulkActionStatus] = useState<string | null>(null);
  const [pendingUpdates, setPendingUpdatesState] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  const firstLoad = useRef(true);

  useEffect(() => {
    setPendingUpdatesState(getPendingUpdates());
  }, []);

  const CustomSingleValue = (props: any) => (
    <components.Option {...props}>
      <div className="flex items-center">
        <span className="text-black">{props.data.label}</span>
      </div>
    </components.Option>
  );

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

  const toggleLeadSelection = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedLeads(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === visibleLeads.length) {
      setSelectedLeads(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedLeads(new Set(visibleLeads.map((l) => l.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedLeads.size === 0 || !bulkActionStatus) return;
    const leadIds = Array.from(selectedLeads);
    const updates = { ...pendingUpdates };
    leadIds.forEach((id) => {
      updates[id] = bulkActionStatus!;
    });
    setPendingUpdates(updates);
    setPendingUpdatesState(updates);
    alert(`Updating ${selectedLeads.size} leads to status: ${bulkActionStatus}`);
    setSelectedLeads(new Set());
    setShowBulkActions(false);
    setBulkActionStatus(null);
    bulkUpdateLeadStatus(leadIds, bulkActionStatus);
  };

  const bulkUpdateLeadStatus = async (leadIds: string[], status: string) => {
    const supabaseClient = createClient();
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    const { data, error } = await supabaseClient.functions.invoke(
      "bulk-update-lead-status",
      { body: { leadIds, status } },
    );
    if (error) {
      const updatedPending = { ...pendingUpdates };
      leadIds.forEach((id) => {
        if (updatedPending[id]) delete updatedPending[id];
      });
      setPendingUpdatesState(updatedPending);
      setPendingUpdates(updatedPending);
      if (Object.keys(updatedPending).length === 0) clearPendingUpdates();
      else setPendingUpdates(updatedPending);
      alert(error);
    }
    return data;
  };

  const refreshLeads = async () => {
    setLoading(true);
    try {
      const { leads, count } = await fetchLeads(
        search, statusFilter, sourceFilter, ownerFilter,
        companyFilter, icpFilter, cityFilter, stateFilter,
        jobTitleFilter, zipCodeFilter, PAGE_SIZE, currentPage,
      );
      setLeads({ leads, count });
      const updatedPending = { ...pendingUpdates };
      let hasChanges = false;
      leads.forEach((lead) => {
        if (updatedPending[lead.id] && updatedPending[lead.id] === lead.status) {
          delete updatedPending[lead.id];
          hasChanges = true;
        }
      });
      if (hasChanges) {
        setPendingUpdatesState(updatedPending);
        setPendingUpdates(updatedPending);
        if (Object.keys(updatedPending).length === 0) clearPendingUpdates();
        else setPendingUpdates(updatedPending);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!firstLoad.current) {
      (async function () {
        const { leads, count } = await fetchLeads(
          search, statusFilter, sourceFilter, ownerFilter,
          companyFilter, icpFilter, cityFilter, stateFilter,
          jobTitleFilter, zipCodeFilter, PAGE_SIZE, currentPage,
        );
        setLeads({ leads, count });
        const updatedPending = { ...pendingUpdates };
        let hasChanges = false;
        leads.forEach((lead) => {
          if (updatedPending[lead.id] && updatedPending[lead.id] === lead.status) {
            delete updatedPending[lead.id];
            hasChanges = true;
          }
        });
        if (hasChanges) {
          setPendingUpdatesState(updatedPending);
          setPendingUpdates(updatedPending);
          if (Object.keys(updatedPending).length === 0) clearPendingUpdates();
          else setPendingUpdates(updatedPending);
        }
      })();
    }
    firstLoad.current = false;
  }, [
    search, statusFilter, sourceFilter, ownerFilter, companyFilter,
    icpFilter, cityFilter, stateFilter, jobTitleFilter, zipCodeFilter, currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search, statusFilter, sourceFilter, ownerFilter, companyFilter,
    icpFilter, cityFilter, stateFilter, jobTitleFilter, zipCodeFilter,
  ]);

  const totalPages = Math.ceil(leads.count / PAGE_SIZE);

  const hasAdvancedFilters =
    companyFilter || cityFilter || stateFilter || jobTitleFilter || zipCodeFilter;

  const hasAnyFilter =
    search || statusFilter.length > 0 || sourceFilter.length > 0 ||
    ownerFilter.length > 0 || icpFilter.length > 0 || statusChip || !!hasAdvancedFilters;

  const clearAllFilters = () => {
    setSearch(""); setStatusFilter([]); setSourceFilter([]);
    setOwnerFilter([]); setIcpFilter([]); setStatusChip(null);
    setCompanyFilter(""); setCityFilter(""); setStateFilter("");
    setJobTitleFilter(""); setZipCodeFilter("");
  };

  // Count per status from current data
  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = leads.leads.filter((l) => l.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  // Filter by status chip
  const visibleLeads = statusChip
    ? leads.leads.filter((l) => l.status === statusChip)
    : leads.leads;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const StatusBadge = ({ status, leadId }: { status: string; leadId: string }) => {
    const pendingStatus = pendingUpdates[leadId];
    const displayStatus = pendingStatus
      ? `${status} → ${pendingStatus} (pending)`
      : status;
    const colors = STATUS_COLORS[status] || { bg: "bg-gray-700/50", text: "text-gray-300" };
    const finalClass = pendingStatus
      ? "bg-yellow-900/30 text-yellow-400"
      : `${colors.bg} ${colors.text}`;
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${finalClass}`}>
        {displayStatus}
      </span>
    );
  };

  const IcpBadge = ({ title, tagColor }: { title: string | null; tagColor: string | null }) => {
    if (!title || !tagColor) return <span className="text-gray-500">—</span>;
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-transparent"
        style={{
          backgroundColor: tagColor + "22",
          color: tagColor,
          borderColor: tagColor + "44",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: tagColor }}
        />
        {title}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs text-purple-400 font-medium font-mono uppercase tracking-wider mb-0.5">
            Pipeline · Step 3
          </p>
          <h1 className="text-2xl font-bold">
            Leads{" "}
            <span className="text-base font-normal text-gray-500">
              {leads.count} total
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/leads/import")}
            className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            <Download size={14} />
            Import
          </button>
          <button
            onClick={() => router.push("/leads/new")}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={14} />
            New Lead
          </button>
        </div>
      </div>

      {/* ── Primary filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search name or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 w-52"
          />
        </div>

        <div className="w-40">
          <Select
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.filter((s) => statusFilter.includes(s.value))}
            onChange={(selected) =>
              setStatusFilter(selected?.map((s) => s.value) || [])
            }
            placeholder="Status"
            components={{ Option: CustomSingleValue }}
            isMulti
          />
        </div>

        <div className="w-40">
          <Select
            options={SOURCE_OPTIONS}
            value={SOURCE_OPTIONS.filter((s) => sourceFilter.includes(s.value))}
            onChange={(selected) =>
              setSourceFilter(selected?.map((s) => s.value) || [])
            }
            placeholder="Source"
            components={{ Option: CustomSingleValue }}
            isMulti
          />
        </div>

        <div className="w-40">
          <Select
            options={ownerOptions}
            value={ownerOptions.filter((o) => ownerFilter.includes(o.value))}
            onChange={(selected) =>
              setOwnerFilter(selected?.map((o) => o.value) || [])
            }
            placeholder="Owner"
            components={{ Option: CustomSingleValue }}
            isMulti
          />
        </div>

        <div className="w-40">
          <Select
            options={icps}
            value={icps.filter((icp) => icpFilter.includes(icp.value))}
            onChange={(selected) =>
              setIcpFilter(selected?.map((icp) => icp.value) || [])
            }
            placeholder="ICP Tag"
            components={{ Option: CustomIcpOption }}
            isMulti
          />
        </div>

        <button
          onClick={refreshLeads}
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
              ? "bg-purple-900/30 border-purple-700/50 text-purple-400"
              : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {showAdvancedFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          More filters
          {hasAdvancedFilters && (
            <span className="bg-purple-500 text-white text-[9px] font-bold px-1 rounded-full ml-0.5">●</span>
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

      {/* ── Advanced filters ── */}
      {showAdvancedFilters && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Company", value: companyFilter, setter: setCompanyFilter, placeholder: "e.g. Acme, Tech Corp" },
            { label: "Job Title", value: jobTitleFilter, setter: setJobTitleFilter, placeholder: "e.g. CEO, Manager" },
            { label: "City", value: cityFilter, setter: setCityFilter, placeholder: "e.g. New York, LA" },
            { label: "State", value: stateFilter, setter: setStateFilter, placeholder: "e.g. CA, NY" },
            { label: "Zip Code", value: zipCodeFilter, setter: setZipCodeFilter, placeholder: "e.g. 10001" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Status filter chips ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setStatusChip(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            !statusChip
              ? "bg-gray-700 border-gray-600 text-gray-200"
              : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400"
          }`}
        >
          All
          <span className="font-mono bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded-full text-[10px]">
            {leads.count}
          </span>
        </button>
        {STATUS_OPTIONS.filter(
          (s) => leads.leads.some((l) => l.status === s.value) || statusChip === s.value,
        ).map((s) => {
          const colors = STATUS_COLORS[s.value] || { bg: "bg-gray-700/50", text: "text-gray-300" };
          const isActive = statusChip === s.value;
          return (
            <button
              key={s.value}
              onClick={() => setStatusChip(isActive ? null : s.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? `${colors.bg} ${colors.text} border-current/30`
                  : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400"
              }`}
            >
              {s.label}
              <span className={`font-mono px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? "bg-black/20" : "bg-gray-700 text-gray-400"
              }`}>
                {statusCounts[s.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Results count ── */}
      <div className="mb-3 text-xs text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-300">{visibleLeads.length}</span>{" "}
        of{" "}
        <span className="font-semibold text-gray-300">{leads.count}</span> leads
      </div>

      {/* ── Table ── */}
      {visibleLeads.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No leads found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedLeads.size === visibleLeads.length &&
                      visibleLeads.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded accent-purple-500"
                  />
                </th>
                {[
                  "Name", "Company", "ICP Tag", "Status",
                  "Source", "Owner", "Email", "Created", "Actions",
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
              {visibleLeads.map((lead) => {
                const isDealReady = DEAL_READY_STATUSES.includes(lead.status);
                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-gray-750 transition-colors ${
                      selectedLeads.has(lead.id) ? "bg-purple-900/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="rounded accent-purple-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-0.5 h-7 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[lead.status]?.text
                                .replace("text-", "")
                                .replace("-400", "") === "blue"
                                ? "#3b82f6"
                                : STATUS_COLORS[lead.status]?.text
                                      .replace("text-", "")
                                      .replace("-400", "") === "orange"
                                  ? "#f59e0b"
                                  : STATUS_COLORS[lead.status]?.text
                                        .replace("text-", "")
                                        .replace("-400", "") === "green"
                                    ? "#22c55e"
                                    : STATUS_COLORS[lead.status]?.text
                                          .replace("text-", "")
                                          .replace("-400", "") === "red"
                                      ? "#ef4444"
                                      : "#6b7280",
                          }}
                        />
                        <span className="font-medium text-gray-200">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {lead.company || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <IcpBadge title={lead.icp_title} tagColor={lead.icp_tag_color} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={lead.status} leadId={lead.id} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {lead.source}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {lead.owner_id?.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {lead.email || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {lead.created_at}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-900/30 transition-colors"
                        >
                          View
                        </Link>
                        {lead.prospect_id && (
                          <Link
                            href={`/prospects/${lead.prospect_id}`}
                            className="text-xs text-gray-400 hover:text-gray-200 font-medium px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            Prospect
                          </Link>
                        )}
                        <Link
                          href={`/leads/${lead.id}/edit`}
                          className="text-xs text-gray-400 hover:text-gray-200 font-medium px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          Edit
                        </Link>
                        {isDealReady && (
                          <Link
                            href={`/deals/new?leadId=${lead.id}`}
                            className="text-xs font-semibold text-white bg-green-700 hover:bg-green-600 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                          >
                            <TrendingUp size={11} /> Deal →
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Floating bulk actions bar ── */}
      {showBulkActions && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 border border-gray-700 shadow-2xl rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-purple-400">
            {selectedLeads.size} selected
          </span>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <select
              value={bulkActionStatus || ""}
              onChange={(e) => setBulkActionStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200"
            >
              <option value="">Update Status…</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
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
              setSelectedLeads(new Set());
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
