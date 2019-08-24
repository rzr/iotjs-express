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

function subscribe(config, callback) {
  var self = this;
  self.config = config;
  this.client = new mqtt.connect(config.connect, function (err, data) {
    verbose('connect: ' + data);
    if (err) {
      throw err;
    }
    self.client.subscribe(
      self.config.topic, self.config.subscribe,
      function(errSubscribe) {
        if (errSubscribe) {
          throw errSubscribe;
        }
        self.client.on('message', callback);
      }
    );
  });
}

function App() {
  var self = this;
  self.values = {};

  self.config = {
    connect: {
      host: 'localhost',
      port: 1883
    },
    subscribe: {
      retain: false,
      qos: 2
    },

    topic: '#'
  };

  var port = 8888;
  if (process.argv[2]) {
    port = Number(process.argv[2]);
  }

  if (process.argv[3]) {
    self.config.topic = String(process.argv[3]);
  }

  if (process.argv[4]) {
    self.config.connect.host = String(process.argv[4]);
  }

  if (process.argv[5]) {
    self.config.connect.port = Number(process.argv[5]);
  }

  subscribe(self.config, function(data) {
    verbose('message: ' + data);
    self.values[data.topic] = JSON.parse(data.message.toString());
  });

  var app = new Express();
  console.log('Listening on:\nhttp://localhost:' + port);

  app.get('/.well-known/security.txt', function(req, res) {
    return res.end('Contact: https://www.npmjs.com/~rzr\n');
  });

  app.get('/', function(req, res) {
    return res.json(self.values[self.config.topic]);
  });

  app.listen(port);
}

// Main App
if (module.parent === null) {
  App();
}
