import { Geist, Geist_Mono } from "next/font/google";
import { redirect } from "next/navigation";
import { LayoutClient } from "./layoutClient";
import "./globals.css";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NetScrunch by Netpace",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  // Fetch profile
  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("full_name, role, department")
    .eq("id", user?.id)
    .single();

  // Fetch pipeline counts + overdue tasks for sidebar
  let overdueTaskCount = 0;
  let prospectCount = 0;
  let leadCount = 0;
  let dealCount = 0;

  if (user && profile) {
    const today = new Date().toISOString().split("T")[0];
    const isManager = profile.role === "manager" || profile.role === "admin";

    // Overdue tasks (personal — always filtered by user)
    const { count: overdue } = await supabaseServer
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "pending")
      .lt("due_date", today);
    overdueTaskCount = overdue ?? 0;

    // Pipeline counts — managers see all, reps see their own
    if (profile.department === "B2B") {
      const prospectQuery = supabaseServer
        .from("prospects")
        .select("id", { count: "exact", head: true });
      const { count: pc } = isManager
        ? await prospectQuery
        : await prospectQuery.eq("owner_id", user.id);
      prospectCount = pc ?? 0;
    }

    const leadQuery = supabaseServer
      .from("leads")
      .select("id", { count: "exact", head: true });
    const { count: lc } = isManager
      ? await leadQuery
      : await leadQuery.eq("owner_id", user.id);
    leadCount = lc ?? 0;

    const dealQuery = supabaseServer
      .from("deals")
      .select("id", { count: "exact", head: true })
      .not("stage", "eq", "Won")
      .not("stage", "eq", "Lost");
    const { count: dc } = isManager
      ? await dealQuery
      : await dealQuery.eq("owner_id", user.id);
    dealCount = dc ?? 0;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Pass user + profile to a CLIENT component that handles interactivity */}
        {user && profile ? (
          <LayoutClient
            user={user}
            profile={profile}
            overdueTaskCount={overdueTaskCount}
            prospectCount={prospectCount}
            leadCount={leadCount}
            dealCount={dealCount}
          >
            {children}
          </LayoutClient>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
