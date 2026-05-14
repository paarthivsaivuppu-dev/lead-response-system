"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusiness } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteSelectedInboundEmailLogs(formData: FormData) {
  const logIds = formData
    .getAll("log_ids")
    .map((value) => String(value))
    .filter(Boolean);

  if (logIds.length === 0) {
    return;
  }

  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No connected business found.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("inbound_email_logs")
    .delete()
    .eq("business_id", business.id)
    .in("id", logIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inbound-emails");
}
