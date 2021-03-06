"use strict";

const config = require("../config.json");
const game = require("../game.json");
const itemsJSON = require("../models/game/data/items.json");
const placesJSON = require("../models/game/data/places.json");
const bluebird = require("bluebird");
const fs = bluebird.promisifyAll(require("fs"));
const marked = require("marked");
marked.setOptions({
	sanitize: false
});
const Handlebars = require("handlebars");

module.exports.index = async(ctx) => {
	const whitelist = await fs.readdirAsync("views/manual/");
	let partialName = "index";
	if (ctx.params.page) {
		// they passed a page, let's use it
		partialName = ctx.params.page;
		if (whitelist.indexOf(`${partialName}.md`) === -1) {
			// this page isn't on the whitelist, fail!
			throw new Error("Page not in whitelist / manualController:index");
		}
	}
	const data = {
		game: game,
		config: config,
		items: itemsJSON,
		places: placesJSON
	};
	const rawFile = await fs.readFileAsync(`views/manual/${partialName}.md`, "utf8");
	// we have to manually replace escaped quotes because of marked
	// https://github.com/chjj/marked/issues/269
	let parsedFile = marked(rawFile);
	parsedFile = parsedFile.replace(/\\&quot;/g, '"');
	const template = Handlebars.compile(parsedFile);
	const final = template(data);
	await ctx.render("manual/index", {
		content: final
	});
};
