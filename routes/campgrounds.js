var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// === INDEX route - näyttää kaikki leiripaikat ===
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) { // Haetaan tietokannasta kaikki leiripaikat. .find({}) == etsi kaikki
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index", {campgrounds:allCampgrounds, page:"campgrounds"});
       }
    });
});


// === CREATE route - Uuden leiripaikan luominen ===

router.post("/", middleware.isLoggedIn, function(req, res){
    // Haetaan kutsun bodysta nimi ja kuva
    var name = req.body.name;
	var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
	// Tallennetaan haetut tiedot muuttujaan. Voidaan myös laittaa suoraan 
	// .create() -metodiin argumentteina
    var newCampground = {name: name, price: price, image: image, description: desc, author:author}
    // Luodaan uusi leiripaikka tietokantaan hyödyntäen malliksi muunnetun skeeman muuttujaa.
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});


// === NEW route - uuden leiripaikan luomisen lomake ===

router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});


// === SHOW route - yksittäisen leiripaikan lisätietojen näkeminen ===

router.get("/:id", function(req, res){
    // Etsitään leiripaikka pyynnön id:llä
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash("error", "Campground not found.");
			res.redirect("back");
        } else {
            //renderöidään show -template löydetyllä leiripaikalla
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


// === EDIT route - olemassa olevan leiripaikan editointi ===

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash("error", "Campground not found.");
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});


// === UPDATE route - olemassa olevan leiripaikan päivitys ===

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    // Etsi ja päivitä oikea leiripaikka
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
      	if(err){
        	res.redirect("/campgrounds");
       	} else {
           // Ohjaa takaisin näyttämään leiripaikka
           res.redirect("/campgrounds/" + req.params.id);
       	}
    });
});


// === DESTROY route

router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res) {
	// Etsi id:llä ja poista
   	Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved) {
		if(err){
          	console.log(err);
      	}
		Comment.deleteMany( {_id: { $in: campgroundRemoved.comments} }, (err) => {
			if(err) {
				console.log(err);
			}
			res.redirect("/campgrounds");
		});
   });
});


// Exportataan moduulista reitittimen data.
module.exports = router;