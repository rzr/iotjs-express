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
var http = require('http');


var options = {
  hostname: 'localhost',
  port: 8888,
  path: '/'
};


function receive(incoming, callback) {
  var data = '';
  incoming.on('data', function (chunk) {
    data += chunk;
  });

  incoming.on('end', function () {
    if (callback) {
      return callback(data);
    }

    return null;
  });
}

// Main
if (module.parent === null) {
  if (process.argv[2]) {
    options.port = Number(process.argv[2]);
  }
  if (process.argv[3]) {
    options.hostname = process.argv[3];
  }
  if (process.argv[4]) {
    options.path = process.argv[4];
  }
  // Workaround bug
  if (!options.headers) {
    options.headers = {};
  }
  if (!options.headers.host) {
    options.headers.host = options.hostname;
  }

  http.request(options, function (res) {
    receive(res, function (data) {
      try {
        var object = JSON.parse(data);
        console.log(JSON.stringify(object));
      } catch (err) {
        console.log(data);
      }
    });
  }).end();
}
