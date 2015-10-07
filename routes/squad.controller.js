'use strict';

var _ = require('lodash');
var Squad = require('../models/squad.model');

exports.index = function(req, res){
  Squad
    .find({})
    .populate('team players')
    .exec(function(err,squads){
      if(err) { return res.send(500, err); }
      return res.json(200,squads);
    });
}

exports.show = function(req, res){
  Squad
    .findById(req.params.id)
    .populate('team players')
    .exec(function(err,squad){
      if(err) { return res.send(500, err); }
      return res.json(200,squad);
    });
}

exports.create = function(req, res){
  Squad
    .create(req.body, function(err, squad) {
      if(err) { return res.send(500, err); }
      return res.json(201, squad);
    });
}

exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Squad
    .findById(req.params.id, function (err, squad) {
      if (err) { return res.send(500, err); }
      if(!squad) { return res.send(404); }
      var updated = _.merge(squad, req.body);
      updated.save(function (err) {
        if (err) { return res.send(500, err); }
        return res.json(200, squad);
      });
    });
};

exports.destroy = function(req, res) {
  Squad
    .findById(req.params.id, function (err, squad) {
      if(err) { return res.send(500, err); }
      if(!squad) { return res.send(404); }
      squad.remove(function(err) {
        if(err) { return res.send(500, err); }
        return res.send(204);
      });
    });
};