import { t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-PQVVhYgw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/submit-C7Hli_5m.js
var submitQuery = () => queryOptions({
	queryKey: ["submissions"],
	queryFn: async () => {
		const [t, s] = await Promise.all([supabase.from("techniques").select("id, sport, name").order("sport").order("name"), supabase.from("submissions").select("*, technique:techniques(name, sport)").order("created_at", { ascending: false })]);
		return {
			techniques: t.data ?? [],
			submissions: s.data ?? []
		};
	}
});
//#endregion
export { submitQuery as t };
