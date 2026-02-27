import ProspectsClient from "./prospectsClient";
import { Metadata } from "next";
import { fetchData, fetchProspects } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Prospects | NetScrunch by Netpace",
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
  const prospects = await fetchProspects();

  return (
    <ProspectsClient
      initialData={{
        count: prospects.count,
        prospects: prospects.prospects,
        owners: ownerData || [],
        icps: icpData || [],
      }}
      role={profile?.role || "sales_rep"}
    />
  );
}
