import { Gt as notFound, _ as createFileRoute, g as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as articleQuery } from "./articles.functions-DQ1YInXE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles._slug-CNP5NQIW.js
var $$splitComponentImporter = () => import("./articles._slug-DkW5zTII.mjs");
var $$splitNotFoundComponentImporter = () => import("./articles._slug-C1AhmM5m.mjs");
var Route = createFileRoute("/articles/$slug")({
	loader: async ({ context, params }) => {
		const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
		if (!article) throw notFound();
		return {
			title: article.title,
			excerpt: article.excerpt
		};
	},
	head: ({ loaderData }) => ({ meta: loaderData ? [
		{ title: `${loaderData.title} — Kinetic` },
		{
			name: "description",
			content: loaderData.excerpt
		},
		{
			property: "og:title",
			content: loaderData.title
		},
		{
			property: "og:description",
			content: loaderData.excerpt
		},
		{
			property: "og:type",
			content: "article"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] : [{ title: "Article unavailable — Kinetic" }, {
		name: "robots",
		content: "noindex"
	}] }),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
