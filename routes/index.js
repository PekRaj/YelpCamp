var express 	= require("express");
var router 		= express.Router();
var passport 	= require("passport");
var User 		= require("../models/user");
var Campground 	= require("../models/campground");

// Root -reitti
router.get("/", function(req, res) {
	res.render("landing");
});


// Rekisteröintilomake
router.get("/register", (req, res) => {
	res.render("register", {page: "register"});
});

// Rekisteröinnin logiikka
router.post("/register", function(req, res) {
    var newUser = new User(
		{
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar
		}
	);
	if (req.body.adminCode === "secretcode123") {
		newUser.isAdmin = true;
	}
    User.register(newUser, req.body.password, (err, user) => { //Passport-local-mongoosen tarjoama metodi, joka häshää samalla salasanan.
        if(err){
            console.log(err);
            return res.render("register", {"error": err.message});
        }
		// passport.authenticate on kirjautumismetodi. Kirjataan rekisteröitynyt käyttäjä heti sisään kun reisteröinti ok.
        passport.authenticate("local")(req, res, function() {
        	req.flash("success", "Welcome to YelpCamp " + user.username); // tietokannasta palautunut käyttäjänimi
			res.redirect("/campgrounds"); 						
        });
    });
});

// Kirjautumislomake
router.get("/login", (req, res) => {
	res.render("login", {page: "login"});
})

//Kirjautumisen logiikka
router.post("/login", passport.authenticate("local", 	// Passportin authenticate metodi middlewarena
	{												// Argumentteina strategia (local), sekä oliona onnistumisen ja epäonnistumisen reitit
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}), (req, res) => {					// Lopuksi callback, joka EI ole pakollinen, vain hahmotusta helpottamaan.
});


// Uloskirjautumisen reitti
router.get("/logout", (req, res) => {
	req.logout();	// Passportin tarjoama metodi uloskirjautumiseen
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

// Käyttäjäprofiilin reitti
router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
	if(err) {
		req.flash("error", "Something went wrong.");
		return res.redirect("/");
	}
    Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
	if(err) {
		req.flash("error", "Something went wrong.");
		return res.redirect("/");
	}
	res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    })
  });
});

// Exportataan moduulista reitittimen data.
module.exports = router;
