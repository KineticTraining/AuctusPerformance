//#region node_modules/.nitro/vite/services/ssr/assets/format-CBApI5FQ.js
function formatDate(iso) {
	return new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC"
	});
}
/** Extracts an 11-char YouTube video id from common URL shapes, or null. */
function youtubeId(url) {
	try {
		const u = new URL(url.trim());
		const host = u.hostname.replace(/^www\.|^m\./, "");
		if (host === "youtu.be") return u.pathname.slice(1, 12) || null;
		if (host === "youtube.com" || host === "music.youtube.com") {
			if (u.pathname === "/watch") return u.searchParams.get("v");
			return u.pathname.match(/^\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})/)?.[2] ?? null;
		}
		return null;
	} catch {
		return null;
	}
}
//#endregion
export { youtubeId as n, formatDate as t };
