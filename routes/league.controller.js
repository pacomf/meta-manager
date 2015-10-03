'use strict';

var _ = require('lodash');
var League = require('../models/league.model');

exports.index = function(req, res){
  League
    .find({})
    .exec(function(err,leagues){
      if(err) { return res.send(500, err); }
      return res.json(200,leagues);
    });
}

exports.show = function(req, res){
  League
    .findById(req.params.id)
    .exec(function(err,league){
      if(err) { return res.send(500, err); }
      return res.json(200,league);
    });
}

exports.create = function(req, res){
  new League({
    name: req.body.name,
    country: req.body.country,
    division: req.body.division
  })
  .save(function(err, league) {
    console.log(league)
    if(err) { return res.send(500, err); }
    return res.json(200,league);
  });
}

exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  League
    .findById(req.params.id, function (err, league) {
      if (err) { return res.send(500, err); }
      if(!league) { return res.send(404); }
      var updated = _.merge(league, req.body);
      updated.save(function (err) {
        if (err) { return res.send(500, err); }
        return res.json(200, league);
      });
    });
};

exports.destroy = function(req, res) {
  League
    .findById(req.params.id, function (err, league) {
      if(err) { return res.send(500, err); }
      if(!league) { return res.send(404); }
      league.remove(function(err) {
        if(err) { return res.send(500, err); }
        return res.send(204);
      });
    });
};

exports.form = function(req, res) {
  res.render('league',{league:"nothing"});
}