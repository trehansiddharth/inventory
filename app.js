var express = require("express");
var _  = require("underscore");
var db = require("./server/db");
var email = require("./server/email");
var util = require("./server/util");

// Create an express app
var app = express();

// Set up pug and the views folder
app.set("view engine", "pug");
app.set("views", "./views");

// / => home page
app.all("/", function (req, res) {
    res.render("home");
});

// /order => item order page
// /order?item=X => order page for item with id X
app.get("/order", function (req, res) {
    res.render("order", { item : req.query.item });
});

// /register => item registration page
app.all("/register", function (req, res) {
    res.render("register", { item : util.generateId(db) });
});

// GET /data/item?id=X => JSON data on item with id X
// GET /data/item?name=X => JSON data on item with name X
app.get("/data/item", function (req, res) {
    var result;
    if (_.has(req.query, "id")) {
        result = db.findItemById(req.query.id);
    } else if (_.has(req.query, "name")) {
        result = db.findItemByName(req.query.name);
    }
    if (result) {
        res.json(result);
    } else {

    }
});

// POST /data/item?id=X&name=X => Update/create record on item with id X
app.post("/data/item", function (req, res) {
    // Run update if id paramater is provided
    var err = true;
    if (_.has(req.query, "id") && _.has(req.query, "name")) {
        err = db.updateItemById(req.query.id, _.omit(req.query, "id"));
    }

    // Serve either success or error page depending on result
    if (err) {
        res.render("error", { text : "Failed to add your item to the database." });
    } else {
        res.render("success", { text : "Successfully added your new item to the database!" });
    }
});

// POST /email?to=X&subject=X&body=X
app.post("/email", function (req, res) {
    // Email about the item
    var err = true;
    if (_.has(req.query, "to") && _.has(req.query, "subject") && _.has(req.query, "body")) {
        err = email.email(req.query.to, req.query.subject, req.query.body);
    }

    // Serve either success or error page depending on the result
    if (err) {
        res.render("error", { text : "Failed to email your order." });
    } else {
        res.render("success", { text : "Successfully emailed your order!" });
    }
});

// /client, /bower_components, /styles, and /static are static directories
app.use("/bower_components", express.static("./bower_components"));
app.use("/client", express.static("./client"));
app.use("/styles", express.static("./styles"));
app.use("/static", express.static("./static"));

// Listen on port 8000
app.listen(8000);
