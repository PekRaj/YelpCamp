var express = require("express");
var router = express.Router({mergeParams: true}); 	// mergeParams yhdistää campgroundsin ja commentsin parametrit, että saadaan
													// samaan id -tietoon käsiksi.
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Kommenttilomake
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // Etsitään leiripaikka pyynnön id:llä
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

// Uuden kommentin lisääminen
router.post("/",middleware.isLoggedIn,function(req, res){
   // Etsitään id:llä
   Campground.findById(req.params.id, function(err, campground) {
       if(err || !campground) {
           console.log(err);
		   req.flash("error", "Campground not found.");
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment) {
           if(err) {
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

// Kommentin editointireitti
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if(err || !foundCampground) {
			req.flash("error", "Campground not found.");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if(err) {
				res.redirect("back");
			} else {
				// campground_id löytyy jo koska koko reitti on campgrounds/:id/...
				res.render("comments/edit", {campground_id: req.params.id, comment: foundComment}); 
			}
   		});
	});	
});

// Kommentin päivittäminen
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
      if(err) {
          res.redirect("back");
      } else {
		  // req.params.id löytyy jo, koska koko reitti on /campgrounds/:id
          res.redirect("/campgrounds/" + req.params.id );
      }
   });
});

// Kommentin tuhoamisreitti
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    // Etsitään id:llä ja poistetaan
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
       if(err) {
           res.redirect("back");
       } else {
		   req.flash("success", "Comment deleted.");
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// Exportataan moduulista reitittimen data.
module.exports = router;