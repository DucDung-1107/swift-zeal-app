import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  title: string;
  icon_key: "shield" | "truck" | "refresh" | string;
  sort_order?: number | null;
};

const defaultServices: Service[] = [
  { id: "default-iso", title: "CHỨNG NHẬN ISO QUỐC TẾ", icon_key: "shield", sort_order: 1 },
  { id: "default-ship", title: "VẬN CHUYỂN TOÀN QUỐC", icon_key: "truck", sort_order: 2 },
  { id: "default-warranty", title: "BẢO HÀNH ĐỔI MỚI 2 NĂM", icon_key: "refresh", sort_order: 3 },
];

export const useServices = () => {
  const supabaseAny = supabase as any;

  return useQuery({
    queryKey: ["services"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Service[]> => {
      try {
        const { data, error } = await supabaseAny
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (!data || !Array.isArray(data) || data.length === 0) return defaultServices;

        return data.map((s: any) => ({
          id: String(s.id),
          title: String(s.title ?? ""),
          icon_key: String(s.icon_key ?? "shield"),
          sort_order: s.sort_order ?? null,
        }));
      } catch {
        // Nếu bảng Supabase chưa có (demo/dev), fallback để UI vẫn chạy.
        return defaultServices;
      }
    },
  });
};

