/* -*- mode: js; js-indent-level:2;  -*-
 * SPDX-License-Identifier: MIT
 *
 * Copyright 2018-present Samsung Electronics France SAS, and other contributors
 *
 * This Source Code Form is subject to the terms of the MIT Licence
 * If a copy of the MIT was not distributed with this file
 * You can obtain one at:
 * https://spdx.org/licenses/MIT.html
 */

var console = require('console');
// Disable logs here by editing to '!console.log'
var verbose = !console.log || function () {};

var Express = null;
try {
  Express = require('../iotjs-express');
} catch (err) {
  Express = require('iotjs-express');
}

var mqtt = require('mqtt');

function publish(options, topic, message) {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }
  this.client = new mqtt.connect(options, function () {
    this.publish(topic, message);
    verbose(message);
  });
}

function App() {
  var http = require('http');
  var port = 8888;
  if (process.argv[2]) {
    port = Number(process.argv[2]);
  }
  var app = new Express();
  var self = http.createServer(app.request);
  console.log('Listening on:\nhttp://localhost:' + port);

  app.get('/.well-known/security.txt', function(req, res) {
    return res.end('Contact: https://www.npmjs.com/~rzr\n');
  });

  app.get('/', function(req, res) {
    res.json({Usage: '/mqtt/:host/:port/:topic/:message'});
  });

  app.get('/mqtt/:host/:port/:topic/:message', function(req, res) {
    publish({
      host: req.params.host,
      port: Number(req.params.port)
    }, req.params.topic, req.params.message);

    return res.json({topic: req.params.topic});
  });

  app.post('/mqtt/:host/:port/:topic', function(req, res) {
    publish({
      host: req.params.host,
      port: Number(req.params.port)
    }, req.params.topic, req.body);

    return res.json({topic: req.params.topic});
  });

  app.put('/mqtt/:host/:port/:topic', function(req, res) {
    publish({
      host: req.params.host,
      port: Number(req.params.port)
    }, req.params.topic, req.body);

    return res.json({topic: req.params.topic});
  });

  self.listen(port);
}

// Main App
if (module.parent === null) {
  App();
}
