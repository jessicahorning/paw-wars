"use strict";

const expect = require("chai").expect;

const main = require("./00-main");
const config = main.config;
const common = main.common;
const model = main.model;

const vendors = main.vendors;

let life;
let vendorObj;
let transaction;

describe("Vendors - Starting State", () => {
	before(() => {
		// set up life
		life = model.generateLife(config.PLAYER, config.LOCATION);
		life.testing = true;
		vendorObj = life.listings.vendors;
	});

	for (const vendor of config.GAME.vendors.enabled) {
		it(`current vendor [${vendor}]should have required properties`, (done) => {
			expect(vendorObj).to.be.a("object");
			expect(vendorObj).to.have.property(vendor);
			expect(vendorObj[vendor]).to.have.property("open");
			expect(vendorObj[vendor]).to.have.property("stock");
			expect(vendorObj[vendor].open).to.be.a("boolean");
			expect(vendorObj[vendor].stock).to.be.an("array");
			return done();
		});

		it(`current vendor [${vendor}] should have correct open status`, (done) => {
			expect(vendorObj[vendor].open).to.equal(config.GAME.vendors[vendor].start_open);
			return done();
		});

		it(`current vendor [${vendor}] should have correct stock`, (done) => {
			if (config.GAME.vendors[vendor].start_open === true) {
				// this vendor started open, it should have stock
				expect(vendorObj[vendor].stock.length).to.equal(config.GAME.vendors[vendor].stock);
			} else {
				// this vendor started closed, it shouldn't have stock
				expect(vendorObj[vendor].stock.length).to.equal(0);
			}
			return done();
		});
	}
});

describe("Vendors - Generate Vendor Listings (Closed)", () => {
	before(() => {
		// set up life
		life = model.generateLife(config.PLAYER, config.LOCATION);
		// being in testing mode will guarantee no vendors are open
		life.testing = true;
		life.current.vendor_meta = "unlucky";
		vendorObj = {};
	});

	for (const vendor of config.GAME.vendors.enabled) {
		it(`current vendor [${vendor}] should create listing`, (done) => {
			vendorObj[vendor] = vendors.generateVendorListings(vendor, life);
			expect(vendorObj[vendor]).to.be.an("object");
			return done();
		});

		it(`current vendor [${vendor}] should be closed`, (done) => {
			expect(vendorObj[vendor].open).to.equal(false);
			return done();
		});

		it(`current vendor [${vendor}] should have no stock`, (done) => {
			expect(vendorObj[vendor].stock.length).to.equal(0);
			return done();
		});
	}
});

describe("Vendors - Generate Vendor Listings (Open)", () => {
	before(() => {
		// set up life
		life = model.generateLife(config.PLAYER, config.LOCATION);
		life.current.vendor_meta = "lucky";
		vendorObj = {};
	});

	for (const vendor of config.GAME.vendors.enabled) {
		it(`current vendor [${vendor}] should create listing`, (done) => {
			vendorObj[vendor] = vendors.generateVendorListings(vendor, life);
			expect(vendorObj[vendor]).to.be.an("object");
			return done();
		});

		it(`current vendor [${vendor}] should be open`, (done) => {
			expect(vendorObj[vendor].open).to.equal(true);
			return done();
		});

		it(`current vendor [${vendor}] should have stock`, (done) => {
			expect(vendorObj[vendor].stock.length).to.equal(config.GAME.vendors[vendor].stock);
			return done();
		});

		it(`current vendor [${vendor}] should have a name`, (done) => {
			expect(vendorObj[vendor]).to.have.property("name");
			return done();
		});

		it(`current vendor [${vendor}] should have a color introduction`, (done) => {
			expect(vendorObj[vendor]).to.have.property("introduction");
			return done();
		});

		it(`current vendor [${vendor}] stock should have all properties`, (done) => {
			for (const stock of vendorObj[vendor].stock) {
				expect(stock).to.have.property("units");
				expect(stock).to.have.property("name");
				expect(stock).to.have.property("price");
				expect(stock).to.have.property("meta");
			}
			return done();
		});
	}
});

describe("Vendors - Handle Vendor Transaction", () => {
	before(() => {
		// set up life
		life = model.generateLife(config.PLAYER, config.LOCATION);
		life.current.vendor_meta = "lucky";
		// give the player some extra cash
		vendorObj = {};
		transaction = {
			id: "testing",
			type: "buy",
			index: 0
		};
	});

	for (const vendor of config.GAME.vendors.enabled) {
		it(`current vendor [${vendor}] should accept transaction`, (done) => {
			// generate listings to fill stock of closed vendors
			life.listings.vendors[vendor] = vendors.generateVendorListings(vendor, life);
			// give them some money so they can buy the items
			life.current.finance.cash += life.listings.vendors[vendor].stock[0].price;
			transaction.vendor = vendor;
			const newLife = vendors.doVendorTransaction(life, transaction);
			expect(newLife).to.be.an("object");
			expect(newLife).to.not.have.property("error");
			return done();
		});
	}
});
