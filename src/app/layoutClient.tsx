"use client";

import { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Menu,
  Power,
  History,
  UserStar,
  UserSearch,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LayoutClient({
  user,
  profile,
  children,
  overdueTaskCount,
  prospectCount,
  leadCount,
  dealCount,
}: {
  user: User;
  profile: { full_name: string; role: string; department: string };
  children: ReactNode;
  overdueTaskCount: number;
  prospectCount: number;
  leadCount: number;
  dealCount: number;
}) {
  const supabaseClient = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.refresh();
  };

  const isManager = profile.role === "admin" || profile.role === "manager";
  const isB2B = profile.department === "B2B";

  const isActive = (href: string) => pathname.startsWith(href);

  const maxPipelineCount = Math.max(prospectCount, leadCount, dealCount, 1);

  const userInitial = (
    profile.full_name?.charAt(0) ||
    user.email?.charAt(0) ||
    ""
  ).toUpperCase();

  return (
    <div className="flex h-screen bg-gray-800">
      {/* ── Sidebar ── */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-56 bg-gray-950 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-0`}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-red-500 tracking-tight">
            NetScrunch
          </h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {/* ── Global ── */}
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={15} />}
            label="Dashboard"
            active={isActive("/dashboard")}
          />
          <NavItem
            href="/tasks"
            icon={<ClipboardList size={15} />}
            label="My Tasks"
            active={isActive("/tasks")}
            badge={overdueTaskCount > 0 ? overdueTaskCount : undefined}
            badgeColor="red"
          />

          {/* ── Pipeline ── */}
          <SectionLabel>Pipeline</SectionLabel>

          {isB2B && (
            <PipelineNavItem
              href="/intended-customer-profiles"
              icon={<UserStar size={15} />}
              label="ICPs"
              step="Step 1"
              description="Define ideal customers"
              active={isActive("/intended-customer-profiles")}
              dotColor="#ef4444"
            />
          )}

          {isB2B && (
            <PipelineNavItem
              href="/prospects"
              icon={<UserSearch size={15} />}
              label="Prospects"
              step="Step 2"
              description="Find and qualify"
              active={isActive("/prospects")}
              badge={prospectCount > 0 ? prospectCount : undefined}
              badgeColor="blue"
              dotColor="#3b82f6"
            />
          )}

          <PipelineNavItem
            href="/leads"
            icon={<Users size={15} />}
            label="Leads"
            step="Step 3"
            description="Nurture and convert"
            active={isActive("/leads")}
            badge={leadCount > 0 ? leadCount : undefined}
            badgeColor="purple"
            dotColor="#8b5cf6"
          />

          <PipelineNavItem
            href="/deals"
            icon={<Briefcase size={15} />}
            label="Deals"
            step="Step 4"
            description="Close and track"
            active={isActive("/deals")}
            badge={dealCount > 0 ? dealCount : undefined}
            badgeColor="green"
            dotColor="#22c55e"
          />

          {/* ── Team (managers only) ── */}
          {isManager && (
            <>
              <SectionLabel>Team</SectionLabel>
              <NavItem
                href="/activity"
                icon={<History size={15} />}
                label="Activity Log"
                active={isActive("/activity")}
              />
            </>
          )}
        </nav>

        {/* Pipeline mini-funnel */}
        {(prospectCount > 0 || leadCount > 0 || dealCount > 0) && (
          <div className="mx-2 mb-2 p-3 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Pipeline Health
            </p>
            {isB2B && (
              <FunnelRow
                label="Prospects"
                count={prospectCount}
                max={maxPipelineCount}
                color="#3b82f6"
              />
            )}
            <FunnelRow
              label="Leads"
              count={leadCount}
              max={maxPipelineCount}
              color="#8b5cf6"
            />
            <FunnelRow
              label="Deals"
              count={dealCount}
              max={maxPipelineCount}
              color="#22c55e"
            />
          </div>
        )}

        {/* User footer */}
        <div className="px-3 py-3 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">
                {profile.full_name || user.email}
              </p>
              <p className="text-[10px] text-gray-500 capitalize">
                {profile.role?.replace("_", " ")}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 ml-2"
            title="Logout"
          >
            <Power size={15} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block" />
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {userInitial}
              </div>
              <span className="text-gray-200 hidden md:inline text-sm">
                {profile.full_name || user.email}
              </span>
              <span className="hidden md:inline text-xs text-gray-500 capitalize bg-gray-800 px-2 py-0.5 rounded">
                {profile.role?.replace("_", " ")}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <Power size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ── Helper sub-components ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[9px] font-semibold text-gray-600 uppercase tracking-widest">
      {children}
    </p>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  badge,
  badgeColor = "blue",
  dotColor,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  badgeColor?: "red" | "blue" | "purple" | "green";
  dotColor?: string;
}) {
  const badgeStyles: Record<string, string> = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-green-500/20 text-green-400",
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
        active
          ? "bg-gray-800 text-gray-100 font-medium"
          : "text-gray-500 hover:bg-gray-800/60 hover:text-gray-300"
      }`}
    >
      {dotColor ? (
        <span
          style={{ color: dotColor }}
          className="flex-shrink-0 w-[15px] flex items-center justify-center"
        >
          <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor">
            <circle cx="4" cy="4" r="4" />
          </svg>
        </span>
      ) : (
        <span className="flex-shrink-0 text-current">{icon}</span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-mono flex-shrink-0 ${badgeStyles[badgeColor]}`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function FunnelRow({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(4, Math.round((count / max) * 100));
  return (
    <div className="flex items-center gap-2 mb-1.5 last:mb-0">
      <span className="text-[10px] text-gray-500 w-[52px] text-right flex-shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[10px] font-mono font-semibold w-5 text-right flex-shrink-0"
        style={{ color }}
      >
        {count}
      </span>
    </div>
  );
}

/* ── Pipeline Nav Item with step description ── */
function PipelineNavItem({
  href,
  icon,
  label,
  step,
  description,
  active,
  badge,
  badgeColor = "blue",
  dotColor,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  step: string;
  description: string;
  active: boolean;
  badge?: number;
  badgeColor?: "red" | "blue" | "purple" | "green";
  dotColor?: string;
}) {
  const badgeStyles: Record<string, string> = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-green-500/20 text-green-400",
  };

  return (
    <Link
      href={href}
      className={`group flex flex-col gap-1 px-3 py-2.5 rounded-md text-sm transition-colors mb-1 ${
        active
          ? "bg-gray-800 text-gray-100 font-medium"
          : "text-gray-500 hover:bg-gray-800/60 hover:text-gray-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {dotColor ? (
          <span
            style={{ color: dotColor }}
            className="flex-shrink-0 w-[15px] flex items-center justify-center"
          >
            <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor">
              <circle cx="4" cy="4" r="4" />
            </svg>
          </span>
        ) : (
          <span className="flex-shrink-0 text-current">{icon}</span>
        )}
        <span className="flex-1 truncate">{label}</span>
        {badge !== undefined && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-mono flex-shrink-0 ${badgeStyles[badgeColor]}`}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 ml-[15px]">
        <span className="text-[9px] font-semibold text-blue-400/80 uppercase tracking-tight">
          {step}
        </span>
        <span className="text-[9px] text-gray-500 group-hover:text-gray-400 transition-colors">
          {description}
        </span>
      </div>
    </Link>
  );
}
