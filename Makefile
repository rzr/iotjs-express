#!/bin/make -f
# -*- makefile -*-
# SPDX-License-Identifier: MIT
# Copyright: 2018-present Samsung Electronics France SAS, and contributors

default: help
	@echo "# log: $@: $^"

project?=iotjs-express
example?=example/index.js
eslint_file?=node_modules/eslint/bin/eslint.js
runtime?=iotjs

deploy_dir ?= ${CURDIR}/tmp/deploy
deploy_modules_dir ?= ${deploy_dir}/iotjs_modules
deploy_module_dir ?= ${deploy_modules_dir}/${project}
deploy_srcs += ${deploy_module_dir}/lib/express.js
deploy_srcs += ${deploy_module_dir}/index.js

hostname?=localhost
domain?=
port?=8080
endpoint?=/
host?=${hostname}${domain}
url?=http://${host}:${port}${endpoint}

help:
	@echo "## Usage:"
	@echo "# make start"

setup/iotjs: extra/tools/iotjs/setup.sh
	$<

setup: setup/iotjs
	@echo "# log: $@: $^"

node/start: ${example}
	node $<

package.json:
	npm init

node_modules: package.json
	npm install

node/npm/start: node_modules
	npm start

start: ${runtime}/start
	@echo "# log: $@: $^"

run: start
	@echo "# log: $@: $^"

cleanall:
	rm -rf iotjs_modules node_modules

${eslint_file}:
	npm install eslint --save-dev

eslint: ${eslint_file} .eslintrc.js
	${eslint_file} --no-color --fix .
	${eslint_file} --no-color .

lint: eslint
	@echo "# log:  $@: $^"

iotjs/start: ${example}
	iotjs $<

iotjs/debug: ${example}
	node $<


${deploy_module_dir}/%: %
	@echo "# TODO: minify: $<"
	install -d ${@D}
	install $< $@

deploy: ${deploy_srcs}
	ls $<

check/runtime/%:
	@iotjs -h 2>&1 | grep -o 'Usage: ${@F}' > /dev/null
	@echo "# log: $@: $^"

check: check/runtime/${runtime}
	@echo "# log: $@: $^"

client/curl:
	curl -i ${url}
	@echo ""

client/iotjs: example/client.js
	${runtime} $<

client: client/curl client/iotjs
	@echo "# log: $@: $^"	

demo:
	curl --version
	curl -i ${url}
	curl -i ${url}.well-known/security.txt
	-curl -i ${url}favicon.ico
