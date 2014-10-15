#!/usr/local/bin/node
var fs = require('fs');
var requirejs = require('requirejs');

var config = {
    baseUrl: 'source',
    name: 'haridashi',
    out: 'dist/haridashi-min.js'
};


requirejs.optimize(config, function (buildResponse) {
    //append a returned requirejs define so sumo is requirejs compatible
    fs.appendFile(config.out, 'define(["main"], function (main) { return main; });', function (err) {
      if (err) throw err;
      console.log('compiled');
    });
}, function(err) {
    //optimization err callback
});