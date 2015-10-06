
var dbPlayer = require('../models/player.model');

exports.mockCreatePlayer = function (){

	var player = new dbPlayer();
	player.name = "Cristiano Ronaldo";
	player.keySearch.push("CR7");
	player.keySearch.push("Cristiano");
	player.keySearch.push("Real Madrid");
	player.save();

	player = new dbPlayer();
	player.name = "Benzema";
	player.keySearch.push("Karim");
	player.keySearch.push("Benzema");
	player.keySearch.push("Real Madrid");
	player.save();

}