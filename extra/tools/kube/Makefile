#! /usr/bin/make -f
# -*- makefile -*-
# ex: set tabstop=4 noexpandtab:
# Copyright: 2019-present Samsung Electronics Co., Ltd. and other contributors
# SPDX-License-Identifier: MIT

default: help
	@echo "# log: $@: $<"


name?=iotjs-express
revision?=$(shell git describe --tags || echo "0.0.0")
port?=8888
nodePort?=30080
type=NodePort
docker?=docker
k8s?=microk8s
kubectl?=${k8s}.kubectl
topdir?=../../..
username?=tmp
image?=${username}/${name}:${revision}
namespace?=k8s.io
hostname=localhost
domain?=${hostname}
host?=${name}.${domain}
endpoint?=/
url?=http://${host}${endpoint}
sudo?=sudo
snap?=snap


help:	
	@echo "### Usage: "
	@echo "# make setup"
	@echo "# make demo"
	@echo "# make start"
	@echo "# make proxy"
	@echo "# make ingress"
	@echo "# make host"
	@echo "# make client"
	@echo "### Config: "
	@echo "# revision=${revision}"
	@echo "# log: $@: $<"

setup/debian/%:
	${sudo} apt-get update
	${sudo} apt-get install -y ${@F}
	${sudo} ${snap} version

setup/${k8s}:
	${sudo} ${snap} install ${k8s} --classic

setup/debian: setup/debian/docker.io setup/debian/snapd
	-groups | grep docker \
	|| echo '# TODO: sudo addgroup ${USER} docker && sudo su -l ${USER}'
	@echo "# log: $@: $<"

setup: setup/debian setup/${k8s}
	@echo "# log: $@: $<"

${name}.yml: deployment.yml service.yml Makefile
	@echo '#YAML' > $@
	@echo '---'  >> $@
	cat deployment.yml >> $@
	@echo '---'  >> $@
	cat service.yml >> $@
	@echo '---'  >> $@

spec: ${name}.yml
	@echo "# log: $@: $<"

${topdir}: Makefile
	@echo "# log: $@: $<"

build: ${topdir} Makefile
	${docker} build --tag "${image}" $<

import: build
	${docker} save "${image}" \
 | ${k8s}.ctr -n ${namespace} image import -
	${k8s}.ctr --namespace ${namespace} image list \
 | grep "${image}"

save: build
	@mkdir -p ${image}.tmp
	@rmdir ${image}.tmp
	time docker save "${image}" > "${image}.tar"
	${k8s}.ctr --namespace ${namespace} image import  "${image}.tar"
	rm "${image}.tar"
	${k8s}.ctr --namespace ${namespace} image list | grep "${image}"

deployment.yml: Makefile
	${kubectl} create deployment ${name} \
 --image "${image}" \
 --dry-run -o yaml > $@

service.yml: deployment.yml Makefile
	${kubectl} apply -f $<
	${kubectl} expose deployment ${name} \
 --type=${type} --port ${port}  \
 --dry-run -o yaml > $@

apply: ${name}.yml
	${kubectl} apply -f $<
	${kubectl} describe service/${name}

enable:
	@echo "TODO check if :80 is used"
	-@${sudo} lsof -i :80
	${k8s}.enable dns
	-${k8s}.disable ingress
	${k8s}.enable ingress
	${k8s}.status | grep 'ingress: enabled'
	-${kubectl} get ing | grep ${name}

ingress: ingress.yml enable
	-${kubectl} delete ingress.extensions/${name}
	sed -e "s|host: .*|host: ${host}|g" < $< | ${kubectl} apply -f -
	${kubectl} get ingress.extensions/${name}
	${kubectl} describe ingress.extensions/${name} | grep "Address:"
	${kubectl} get ing

client:
	-ping -c 1 ${host}
	curl -kLi ${url}

client/test:
	-curl -kLi ${url}
	-curl -kLi ${url}.well-known/security.txt
	-curl -kLi ${url}favicon.ico

status:
	${MAKE} status/all | grep ${name}
	-${kubectl} describe ingress.extensions/${name}
	-${kubectl} describe ingress.extensions/${name} | grep "Address:" \
 || echo "warning: Address missing in ingress"
	-${k8s}.ctr --namespace ${namespace} image list | grep "${image}"
	-grep "${host}" /etc/hosts

status/all:
	-${kubectl} get all
	-${kubectl} get all --all-namespaces
	-${kubectl} get ingress.extensions

start: help spec import apply enable ingress
	@echo "# log: $@: $<"

run: apply status proxy client
	@echo "# make status proxy"
	@echo "# make status ingress"
	@echo "# make status host"
	@echo "# make status client"

demo: delete start
	${MAKE} run \
 || echo "# log: may be failed, try again: make status run"
	@echo "# log: $@: $<"

patch:
	${kubectl} patch service/${name}  --type='json' \
 --patch="[{\"op\": \"replace\", \"path\": \"/spec/ports/0/nodePort\", \"value\":${nodePort}}]"

proxy:
	sPort=$$(${kubectl} get service/${name} \
 -o=jsonpath="{.spec.ports[?(@.port==${port})].nodePort}") \
 && echo "sPort=$${sPort}" \
 && sUrl="http://127.0.0.1:$${sPort}" \
 && curl -kLi $${sUrl}


host: /etc/hosts
	ping -c1 ${host} || echo "127.0.0.1 ${host}" | ${sudo} tee -a $<
	ping -c1 ${host}

delete:
	rm -fv deployment.yml service.yml ${name}.yml
	-${kubectl} delete service/${name}
	-${kubectl} delete deployment.apps/${name}
	-${kubectl} delete ingress.extensions/${name}

log/nginx-ingress:
	pod=$(shell ${kubectl} get all | grep -o "pod/${@F}-[^ ]*" || echo "pod/TODO/$@") \
 && echo "# log: pod=$${pod}" \
 && ${kubectl} describe "$${pod}" \
 && ${kubectl} log -f "$${pod}"


log: log/nginx-ingress
	@echo "# log: $@: $<"

