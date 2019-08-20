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
var fs = require('fs');

var Express = null;
try {
  Express = require('../iotjs-express');
} catch (err) {
  Express = require('iotjs-express');
}

// Main
if (module.parent === null) {
  var port = 8888;
  var db = {};
  if (process.argv[2]) {
    port = Number(process.argv[2]);
  }
  var app = new Express();
  app.set('x-powered-by');
  console.log('Listening on:\nhttp://localhost:' + port);
  app.get('/', function(req, res) {
    return res.json({});
  });

  app.get('/.well-known/security.txt', function(req, res) {
    return res.end('Contact: https://www.npmjs.com/~rzr\n');
  });

  app.put('/db/:key', function(req, res) {
    console.log(req.body);
    db[req.params.key] = req.body.value;

    return res.json(db);
  });

  app.get('/~:user', function(req, res) {
    return res.json({user: req.params.user});
  });

  app.get('/static/:filename', function(req, res) {
    fs.readFile(req.params.filename, function(err, data) {
      if (err) {
        throw err;
      }

      return res.end(data);
    });
  });
  app.listen(port);
}
