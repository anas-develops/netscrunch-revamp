"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  Filter,
  User,
  Tag,
  Plus,
  CopyIcon,
  X,
} from "lucide-react";
import { IntendedCustomerProfile, Owner } from "./types";
import Link from "next/link";
import { copyToClipboard } from "@/lib/utils/general";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ["Applied", "Conversation", "Interview", "Won", "Lost"];
const SOURCE_OPTIONS = [
  "Upwork",
  "Freelancer",
  "Recruitment",
  "B2B",
  "Referral",
];

export default function IntendedCustomerProfilesClient({
  fetchData,
  fetchIcps,
  initialData,
}: {
  fetchData: () => Promise<
    | {
        id: any;
        full_name: any;
      }[]
    | null
  >;
  fetchIcps: (
    search?: string | null,
    ownerFilter?: string | null,
    pageSize?: number,
    currentPage?: number
  ) => Promise<{
    icps: IntendedCustomerProfile[];
    count: number;
  }>;
  initialData: {
    icps: IntendedCustomerProfile[];
    owners: Owner[] | null;
    count: number;
  };
}) {
  const [icps, setIcps] = useState<{
    icps: IntendedCustomerProfile[];
    count: number;
  }>({
    icps: initialData.icps || [],
    count: initialData.count || 0,
  });
  const owners: Owner[] = initialData.owners || [];
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const firstLoad = useRef(true);

  useEffect(() => {
    if (!firstLoad.current) {
      (async function () {
        const { icps, count } = await fetchIcps(
          search,
          ownerFilter,
          PAGE_SIZE,
          currentPage
        );

        setIcps({ icps, count });
      })();
    }

    firstLoad.current = false;
  }, [search, ownerFilter, currentPage]);

  const totalPages = Math.ceil(icps.count / PAGE_SIZE);

  // --- Reset to page 1 when filters change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sourceFilter, ownerFilter]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const colorMap: Record<string, string> = {
      Applied: "bg-blue-100 text-blue-800",
      Conversation: "bg-orange-100 text-orange-800",
      Interview: "bg-purple-100 text-purple-800",
      Won: "bg-green-100 text-green-800",
      Lost: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${
          colorMap[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs text-blue-400 font-medium font-mono uppercase tracking-wider mb-0.5">
            Pipeline · Step 1
          </p>
          <h1 className="text-2xl font-bold">
            Intended Customer Profiles{" "}
            <span className="text-base font-normal text-gray-500">
              {icps.count} total
            </span>
          </h1>
          <div className="mt-2 bg-green-900/20 border border-green-800/30 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-green-400 mb-1.5 flex items-center gap-1.5">
              <span>🎯</span> Monthly Workflow: ICP Analysis
            </p>
            <ol className="text-xs text-gray-300 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">1.</span>
                <span>Review which ICPs generate the most leads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">2.</span>
                <span>Check <Link href="/prospects" className="text-green-400 hover:underline font-medium">Prospects</Link> by ICP tag to assess quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">3.</span>
                <span>Identify low-performing ICPs to deprioritize</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">4.</span>
                <span>Create new ICPs for emerging segments</span>
              </li>
            </ol>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/intended-customer-profiles/import")}
            className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            <Download size={14} />
            Import ICP
          </button>
          <button
            onClick={() => router.push("/intended-customer-profiles/new")}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={14} />
            New ICP
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-52"
          />
        </div>

        <div className="w-44">
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
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
          statusFilter !== "all" ||
          sourceFilter !== "all" ||
          ownerFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
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
        Showing <strong>{icps.icps?.length}</strong> of{" "}
        <strong>{icps.count}</strong> profiles
      </div>

      {/* Table */}
      {icps.icps?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No ICPs found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Copy Tag ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {icps.icps?.map((icp) => (
                <tr key={icp.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: icp.tag_color + "30",
                        color: icp.tag_color,
                      }}
                    >
                      {icp.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CopyIcon
                      onClick={() => copyToClipboard(icp.id)}
                      className="cursor-pointer hover:brightness-75 text-gray-400"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {!!icp.description &&
                    typeof icp.description === "string" &&
                    icp.description?.length
                      ? icp.description.slice(0, 20) + "..."
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {icp.owner.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {icp.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/intended-customer-profiles/${icp.id}/edit`}
                      className="text-blue-400 font-bold cursor-pointer hover:text-blue-300 transition-colors"
                    >
                      Edit
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
