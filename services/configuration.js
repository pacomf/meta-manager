'use strict';

var importData = require('./importData.js');
var jobScheduling = require('./jobScheduling.js');

var mocks = require('./hacks.js');

exports.mockMode = 0;

exports.init = function(app){

	this.mockMode = 0;

	// Crea 2 jugadores en modo Mock, solo para asignar KEYS para buscar despues en el RSS
	//mocks.mockCreatePlayer();


	//importData.addTeams("56150128c7d48fb01a5ffd34");
	//jobScheduling.scheduleRss();
	//jobScheduling.scheduleTwitter();
}
