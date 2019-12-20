var Campground = require("../models/campground");
var Comment = require("../models/comment");

// Kaikki middlewaret ovat tässä oliossa, joka exportataan lopuksi
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
 	if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err || !foundCampground) {	// Virhehallintaan, mikäli käyttäjä käsin muuttaa leiripaikan URL:n 
			   req.flash("error", "Campground not found.");
               res.redirect("back");
           }  else {
               // Verrataan requestin user._id:tä löydetyn campgroundin authorin id:n kanssa.
			   // Käytettävä .equals -metodia, koska foundCampground.author on olio, ei merkkijono kuten req.user._id.
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
				next();
            } else {
				req.flash("error", "Only the submitter can make changes to campgrounds.");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 	if(req.isAuthenticated()) {
	 	// Etsitään kommentti sen id:n perusteella
        Comment.findById(req.params.comment_id, function(err, foundComment) {
           if(err || !foundComment) {
			   req.flash("error", "Comment not found.");
               res.redirect("back");
           }  else {
               // Verrataan löydetyn kommentin authoria user._id:n. Käytettävä .equalsia, koska kommentin id on olio, user._id merkkijono. 
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
				req.flash("error", "Only the poster of the comment can do that.");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "You need to logged in to do that.");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
	req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

module.exports = middlewareObj;