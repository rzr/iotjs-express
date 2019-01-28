#!/bin/make -f
# -*- makefile -*-
# SPDX-License-Identifier: MIT
# Copyright: 2018-present Samsung Electronics France SAS, and contributors

default: help iotjs/run

example?=example/index.js
eslint_file?=node_modules/eslint/bin/eslint.js
runtime?=iotjs

help:
	@echo "Usage:"
	@echo "# make run"

node/run: ${example}
	node $<

package.json:
	npm init

node_modules: package.json
	npm install

node/run: node_modules
	npm start

run: ${runtime}/run
	@echo "# $@: $^"

cleanall:
	rm -rf iotjs_modules node_modules

${eslint_file}:
	npm install eslint --save-dev

eslint: ${eslint_file} .eslintrc.js
	${eslint_file} --no-color --fix .
	${eslint_file} --no-color .

lint: eslint
	@echo "# $@: $^"

iotjs/run: ${example}
	iotjs $<

iotjs/debug: ${example}
	node $<
