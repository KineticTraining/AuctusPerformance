import { l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { t as createServerRpc } from "./createServerRpc-CxD4EZ5P.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { n as analysisSchema, r as requireSupabaseAuth, t as analysisJsonSchema } from "./analysis-M8RQht2q.mjs";
import { n as youtubeId } from "./format-CBApI5FQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analysis.functions-CoyOSEhD.js
var MODEL = "google/gemini-3.8-flash";
/** Runs AI technique review for one of the caller's submissions and stores the result. */
var analyzeSubmission_createServerFn_handler = createServerRpc({
	id: "516ba94b5e12f6a9809063bf1f06eb4d946fcaaa3f7fd24a334dda9e868332c7",
	name: "analyzeSubmission",
	filename: "src/lib/analysis.functions.ts"
}, (opts) => analyzeSubmission.__executeServer(opts));
var analyzeSubmission = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ submissionId: stringType().uuid() }).parse(input)).handler(analyzeSubmission_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { generateChatCompletion, GatewayError } = await import("../_libs/lovable.dev__ai-gateway.mjs").then((n) => n.t);
	const { data: sub, error } = await supabase.from("submissions").select("id, user_id, title, video_url, notes, technique:techniques(sport, name, summary, key_cues, common_faults, drills)").eq("id", data.submissionId).maybeSingle();
	if (error || !sub || sub.user_id !== userId) throw new Error("Submission not found");
	const { data: profile } = await supabase.from("profiles").select("display_name, sport, level").eq("id", userId).maybeSingle();
	await supabase.from("submissions").update({
		status: "analyzing",
		error: null
	}).eq("id", sub.id);
	const t = sub.technique;
	const reference = t ? [
		`TECHNIQUE: ${t.name} (${t.sport})`,
		`Model: ${t.summary}`,
		`Key cues:\n- ${t.key_cues.join("\n- ")}`,
		`Common faults:\n- ${t.common_faults.join("\n- ")}`,
		`Recommended drills:\n- ${t.drills.join("\n- ")}`
	].join("\n\n") : "No specific technique selected. Identify the skill from the video/notes and use general sport-science coaching principles.";
	const system = [
		"You are an elite sports technique coach. Review the athlete's rep against the TECHNIQUE DATABASE entry.",
		"Be specific, encouraging and practical. Reference cues and faults from the database by name when they apply.",
		"If you cannot see the video, set video_reviewed to false and base feedback only on the athlete's notes; never invent what happens in a video you did not watch.",
		"Return JSON matching the schema."
	].join(" ");
	const userText = `${`ATHLETE: ${profile?.display_name || "Athlete"}, sport: ${profile?.sport || "unknown"}, level: ${profile?.level || "unknown"}`}\n\nSUBMISSION: ${sub.title}\nVideo link: ${sub.video_url}\nAthlete notes: ${sub.notes || "(none)"}\n\nTECHNIQUE DATABASE ENTRY:\n${reference}`;
	const yt = youtubeId(sub.video_url);
	async function run(withVideo) {
		const content = [{
			type: "text",
			text: userText
		}];
		if (withVideo && yt) content.push({
			type: "video_url",
			video_url: { url: `https://www.youtube.com/watch?v=${yt}` }
		});
		const raw = (await generateChatCompletion({
			model: MODEL,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content
			}],
			response_format: {
				type: "json_schema",
				json_schema: {
					name: "technique_review",
					strict: true,
					schema: analysisJsonSchema
				}
			}
		})).choices?.[0]?.message?.content;
		const text = typeof raw === "string" ? raw : "";
		const parsed = analysisSchema.parse(JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")));
		if (!withVideo || !yt) parsed.video_reviewed = false;
		return parsed;
	}
	try {
		let analysis;
		try {
			analysis = await run(true);
		} catch (e) {
			if (!yt || !(e instanceof GatewayError) || e.code === "payment_required") throw e;
			analysis = await run(false);
		}
		await supabase.from("submissions").update({
			status: "complete",
			analysis,
			analyzed_at: (/* @__PURE__ */ new Date()).toISOString(),
			error: null
		}).eq("id", sub.id);
		return {
			status: "complete",
			analysis
		};
	} catch (e) {
		console.error("analyzeSubmission failed", e);
		const message = e instanceof GatewayError && e.httpStatus === 402 ? "AI credits are used up. Please try again later." : e instanceof GatewayError && e.httpStatus === 429 ? "The AI coach is busy. Please retry in a minute." : "The AI review couldn't be completed. Please retry.";
		await supabase.from("submissions").update({
			status: "failed",
			error: message
		}).eq("id", sub.id);
		return {
			status: "failed",
			analysis: null
		};
	}
});
//#endregion
export { analyzeSubmission_createServerFn_handler };
