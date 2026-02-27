import LeadsClient from "./leadsClient";
import { Metadata } from "next";
import { fetchData, fetchLeads } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Lead | NetScrunch by Netpace",
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const { ownerData, icpData } = await fetchData();
  const leads = await fetchLeads();

  return (
    <LeadsClient
      fetchLeads={fetchLeads}
      initialData={{
        count: leads.count,
        leads: leads.leads,
        owners: ownerData,
        icps: icpData,
      }}
      role={profile?.role || "sales_rep"}
    />
  );
}
