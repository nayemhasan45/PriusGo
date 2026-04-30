"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function FleetCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      const { count: carCount } = await supabase
        .from("cars")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");
      if (carCount !== null) setCount(carCount);
    }
    void load();
  }, []);

  return <>{count ?? "—"}</>;
}
