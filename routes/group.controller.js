'use strict';

var _ = require('lodash');
var Group = require('../models/group.model');

exports.index = function(req, res){
  Group
    .find({})
    .populate('team players')
    .exec(function(err,groups){
      if(err) { return res.send(500, err); }
      return res.json(200,groups);
    });
}

exports.show = function(req, res){
  Group
    .findById(req.params.id)
    .populate('team players')
    .exec(function(err,group){
      if(err) { return res.send(500, err); }
      return res.json(200,group);
    });
}

exports.create = function(req, res){
  Group
    .create(req.body, function(err, group) {
      if(err) { return res.send(500, err); }
      return res.json(201, group);
    });
}

exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Group
    .findById(req.params.id, function (err, group) {
      if (err) { return res.send(500, err); }
      if(!group) { return res.send(404); }
      var updated = _.merge(group, req.body);
      updated.save(function (err) {
        if (err) { return res.send(500, err); }
        return res.json(200, group);
      });
    });
};

exports.destroy = function(req, res) {
  Group
    .findById(req.params.id, function (err, group) {
      if(err) { return res.send(500, err); }
      if(!group) { return res.send(404); }
      group.remove(function(err) {
        if(err) { return res.send(500, err); }
        return res.send(204);
      });
    });
};