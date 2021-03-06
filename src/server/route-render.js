import path from "path";
import React from "react";
import Helmet from "react-helmet";
import { StaticRouter } from "react-router-dom";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
// loadable
import { ChunkExtractor, ChunkExtractorManager } from "@loadable/server";
// redux
import { Provider } from "react-redux";

import Html from "./Html";
import configureStore from "../client/store";
import { fetchData } from "../client/core/RouteDataLoader";

const nodeStats = path.resolve(__dirname, "../../public/dist/node/loadable-stats.json");
const webStats = path.resolve(__dirname, "../../public/dist/web/loadable-stats.json");

const renderRoute = (req, res) => {
	let context = {};
	const nodeExtractor = new ChunkExtractor({
		statsFile: nodeStats,
		outputPath: path.resolve("public/dist/node")
	});
	const { default: App } = nodeExtractor.requireEntrypoint();

	const webExtractor = new ChunkExtractor({
		statsFile: webStats,
		outputPath: path.resolve("public/dist/web")
	});
	console.log("render: ", req.url);
	const store = configureStore();

	fetchData({ pathname: req.url }, store, true).then((r) => {
		const content = renderToStaticMarkup(
			<ChunkExtractorManager extractor={webExtractor}>
				<Provider store={store}>
					<StaticRouter location={req.url} context={context}>
						<App />
					</StaticRouter>
				</Provider>
			</ChunkExtractorManager>
		);
		res.status(context.status || 200);
		if (context.status == 301) {
			res.redirect(context.url);
		} else {
			const helmet = Helmet.rewind();
			const initial_state = store.getState();

			res.set("content-type", "text/html");
			res.send(
				"<!DOCTYPE html>" +
					renderToString(
						<Html
							{...{
								extractor: webExtractor,
								content,
								helmet,
								initial_state
							}}
						/>
					)
			);
		}
	});
};

export default renderRoute;
