import DealsClient from "./dealsClient";
import { fetchDeals, fetchOwners } from "./actions";
import { Deal } from "./types";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Deals | NetScrunch by Netpace",
};

export default async function DealsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  // Initial load: page 1, no filters
  const initialData = await fetchDeals(null, null, null, null, 20, 1);
  const owners = (await fetchOwners()) || [];

  return (
    <DealsClient
      initialData={{
        deals: initialData.deals as unknown as Deal[],
        count: initialData.count,
        owners,
      }}
      role={profile?.role || "sales_rep"}
    />
  );
}
