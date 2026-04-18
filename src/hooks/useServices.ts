import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  title: string;
  icon_key: "shield" | "truck" | "refresh" | string;
  sort_order?: number | null;
};

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await (supabase as any)
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: String(s.id),
        title: String(s.title ?? ""),
        icon_key: String(s.icon_key ?? "shield"),
        sort_order: s.sort_order ?? null,
      }));
    },
  });
};

