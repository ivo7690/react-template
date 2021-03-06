import path from "path";
import express from "express";
import renderRoute from "./route-render";
const favicon = require("serve-favicon");
const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 9000;
global.NODE_ENV = NODE_ENV
global.__DEV__ = NODE_ENV === 'development';
global.__PROD__ = NODE_ENV !== 'development';
global.__SERVER__ = true;
global.__CLIENT__ = false;

const serve = (path, cache) =>
	express.static(path, {
		maxAge: cache && NODE_ENV === 'production' ? 1000 * 60 * 60 * 24 * 30 : 0,
	});

const app = express();
let dev_instance;
app.use(express.static(path.join(__dirname, "../../public")));

// serve favicon
app.use("/manifest.json", serve(path.join(__dirname, "../../public", "manifest.json"), true));
app.use(favicon(path.join(__dirname, "../../public", "favicon.ico")));

if (NODE_ENV !== "production") {
	/* eslint-disable global-require, import/no-extraneous-dependencies */
	const { default: webpackConfig } = require("../../webpack.config.babel");
	const webpackDevMiddleware = require("webpack-dev-middleware");
	const webpack = require("webpack");
	/* eslint-enable global-require, import/no-extraneous-dependencies */

	const compiler = webpack(webpackConfig);
	dev_instance = webpackDevMiddleware(compiler, {
		logLevel: "silent",
		publicPath: "/dist/web",
		writeToDisk: (filePath) => {
			return /dist\/node\//.test(filePath) || /loadable-stats/.test(filePath);
		}
	});
	console.log("webpack building...");
	app.use(dev_instance);

	app.use(require("webpack-hot-middleware")(compiler.compilers[0]));
}

app.get(/^[^.]+$|\.(?!(jpg|gif|png|css|js)$)([^.]+$)/, renderRoute);

app.get("*",(req, res, next) => {
	res.status(404);
	res.redirect('/error');
});
// error handling
app.use((err, req, res, next) => {
	console.error(`error: ${err.message}}`);
	console.log(err)
	res.status(err.status || 500);
});

// eslint-disable-next-line no-console
app.listen(PORT, () => {
	if (NODE_ENV !== "production") {
		dev_instance.waitUntilValid(() => {
			console.log(`Server started http://localhost:${PORT}`);
		});
	} else {
		console.log(`Server started http://localhost:${PORT}`);
	}
});
