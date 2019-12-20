var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema( { // Skeeman alustaminen
	name: String,
	price: String,
	image: String,
	description: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Campground", campgroundSchema); // Skeeman muuntaminen malliksi, jotta saadaan metodit käyttöön. Palautetaan tiedostosta.