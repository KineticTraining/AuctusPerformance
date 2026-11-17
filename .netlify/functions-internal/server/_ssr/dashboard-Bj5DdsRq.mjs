import { t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-SAOWSTXM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Bj5DdsRq.js
var dashboardQuery = () => queryOptions({
	queryKey: ["dashboard"],
	queryFn: async () => {
		const [{ data: auth }, videos, subs] = await Promise.all([
			supabase.auth.getUser(),
			supabase.from("videos").select("*").order("section").order("sort_order"),
			supabase.from("submissions").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(5)
		]);
		const userId = auth.user?.id ?? "";
		const { data: profile } = await supabase.from("profiles").select("display_name, sport, level").eq("id", userId).maybeSingle();
		return {
			profile,
			videos: videos.data ?? [],
			submissions: subs.data ?? []
		};
	}
});
//#endregion
export { dashboardQuery as t };
