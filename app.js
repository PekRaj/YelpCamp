var express 		= require("express"),
	app 			= express(),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	passport		= require("passport"),
	LocalStrategy 	= require("passport-local"),
	Campground		= require("./models/campground"),
	User			= require("./models/user"),
	Comment			= require("./models/comment"),
	methodOverride	= require("method-override"),
	flash			= require("connect-flash"),
	moment			= require("moment");

// Reittien alustaminen
var commentRoutes	= require("./routes/comments"),
	campgroundRoutes= require("./routes/campgrounds"),
	indexRoutes		= require("./routes/index");

require('dotenv').config();
// Mongoosen yhdistäminen.
mongoose.connect(process.env.DB_URL, {
// mongoose.connect("mongodb://localhost:27017/yelp_camp", { // Paikallinen db.
	useNewUrlParser: true, 
	useUnifiedTopology: true 
	}, (err) => {
		if(!err) {
			console.log("DB connected");
		} else {
			console.log("DB error: " + err);
		}
});

app.use(bodyParser.urlencoded({extended: true})); // body-parserilla saadaan pyyntöjen bodyt olioiksi stringien sijaan
app.set("view engine", "ejs"); // Asetetaan "oletustiedostoksi" .ejs
app.use(express.static(__dirname + "/public"));	// CSS:n kansio käyttöön.
app.use(methodOverride("_method")); // formien put ja delete methodien käyttöönotto
app.use(flash());	// Flash messaget virheilmoituksille
app.locals.moment = require('moment');	// Postauksen ajankohdan näyttämiseksi. Kaikille view-fileille käyttöön tällä.


// Passport konfigurointi
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware, jolla saadaan lisättyä currentUser ja flash messageiden muuttujat kaikkiin templateihin.
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})

// Annetaan appille tiedot käytettävistä reititystiedostoista
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);


// Serveri käyntiin
app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("YelpCamp server started.");
});