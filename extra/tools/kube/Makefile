#! /usr/bin/make -f
# -*- makefile -*-
# ex: set tabstop=4 noexpandtab:
# Copyright: 2019-present Samsung Electronics Co., Ltd. and other contributors
# SPDX-License-Identifier: MIT

default: help
	@echo "# log: $@: $^"


name?=iotjs-express
revision?=$(shell git describe --tags 2> /dev/null || echo "0.0.0")
port?=8888
nodePort?=30080
type=NodePort
docker?=docker
k8s?=microk8s
k8s_prefix?=${k8s}.
kubectl?=/snap/bin/${k8s}.kubectl
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
PATH:=${PATH}:/snap/bin
export PATH
#snap_install_args?=--channel 1.15/stable


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
	@echo "# log: $@: $^"

setup/debian/%:
	${sudo} apt-get update
	${sudo} apt-get install -y ${@F}
	${sudo} ${snap} version

setup/${k8s}:
	${sudo} ${snap} refresh
	${sudo} ${snap} info ${k8s}
	${sudo} ${snap} install ${k8s} ${snap_install_args} --classic
	@echo "# ${sudo} ${snap} remove ${k8s} # To remove"

setup/debian: setup/debian/docker.io /etc/docker/daemon.json \
  setup/debian/snapd \
  setup/debian/lsof \
  setup/debian/time
	-groups | grep docker \
	|| echo '# TODO: sudo addgroup ${USER} docker && sudo su -l ${USER}'
	@echo "# log: $@: $^"

user:
	@groups | grep docker || { ${sudo} usermod -a -G docker "${USER}" && echo 'sudo su -l ${USER}' ; }
	@groups | grep ${k8s} || { ${sudo} usermod -a -G ${k8s} "${USER}" && echo 'sudo su -l ${USER}' ; }

setup: setup/debian setup/${k8s}
	@echo "# log: $@: $^"


evict:  /var/snap/${k8s}/current/args/kubelet
	${k8s}.status --wait-ready
	${kubectl} get all | grep 'Evicted'
	grep eviction "$<"
	sudo sed -b -e 's|1Gi|100Mi|g' -i "$<"

restart:
	${MAKE} stop start


${name}.yml: deployment.yml service.yml Makefile
	@echo '#YAML' > $@
	@echo '---'  >> $@
	cat deployment.yml >> $@
	@echo '---'  >> $@
	cat service.yml >> $@
	@echo '---'  >> $@

spec: ${name}.yml
	@echo "# log: $@: $^"

${topdir}: Makefile
	@echo "# log: $@: $^"

build: ${topdir} Makefile
	${docker} build --tag "${image}" $<

import: build
	${k8s}.status --wait-ready
	${docker} save "${image}" \
 | time ${sudo} ${k8s}.ctr -n ${namespace} image import -
	${k8s}.status --wait-ready

image:
	${sudo} ${k8s}.ctr --namespace ${namespace} image list \
  | grep "${image}" \
  || ${sudo} ${k8s}.ctr --namespace ${namespace} image list \
  | grep "${name}"

save: build
	@mkdir -p ${image}.tmp
	@rmdir ${image}.tmp
	time docker save "${image}" > "${image}.tar"
	${k8s}.status --wait-ready
	${k8s}.ctr --namespace ${namespace} image import  "${image}.tar"
	rm "${image}.tar"
	${k8s}.status --wait-ready
	${k8s}.ctr --namespace ${namespace} image list | grep "${image}"

deployment.yml: Makefile
	${k8s}.status --wait-ready
	${kubectl} create deployment ${name} \
 --image "${image}" \
 --dry-run -o yaml > $@

service.yml: deployment.yml Makefile
	${k8s}.status --wait-ready
	${kubectl} apply -f $<
	${kubectl} expose deployment ${name} \
 --type=${type} --port ${port}  \
 --dry-run -o yaml > $@

apply: ${name}.yml
	${k8s}.status --wait-ready
	${kubectl} apply -f $<
	${kubectl} describe service/${name}
	${k8s}.status --wait-ready

enable:
	${k8s}.status --wait-ready
	@echo "TODO check if :80 is used"
	-@${sudo} lsof -i :80
	${k8s}.enable dns
	${k8s}.status --wait-ready
	-${k8s}.disable ingress
	${k8s}.status --wait-ready
	${k8s}.enable ingress
	${k8s}.status --wait-ready
	${k8s}.status | grep 'ingress: enabled' || ${k8s}.status | grep "ingress: " || sleep 10
	${k8s}.status | grep 'ingress: enabled'

ingress: ingress.yml # enable
	${k8s}.status --wait-ready
	-${kubectl} delete ingress.extensions/${name}
	sed -e "s|host: .*|host: ${host}|g" < $< | ${kubectl} apply -f -
	${k8s}.status --wait-ready
	${kubectl} get ingress.extensions/${name}
	${kubectl} describe ingress.extensions/${name} | grep "Address: "
	${kubectl} get ing
	${MAKE} log/nginx-ingress
	@echo "# log: Wait Ready Status ($@)"

client:
	-ping -c 1 ${host}
	curl -kLi ${url}

client/test:
	-curl -kLi ${url}
	-curl -kLi ${url}.well-known/security.txt
	-curl -kLi ${url}favicon.ico

inspect: 
	-sudo mv -v \
/var/snap/${k8s}/current/inspection-report \
/var/snap/${k8s}/current/inspection-report._$(shell date -u +"%Y%m%d_%s").bak
	${sudo} ${k8s}.inspect

status:
	-${k8s}.status 
	${k8s}.status --wait-ready || ${MAKE} inspect
	${MAKE} status/all | grep ${name}
	-${kubectl} get ing | grep ${name}
	-${kubectl} describe ingress.extensions/${name}
	-${kubectl} describe ingress.extensions/${name} | grep "Address:" \
 || echo "warning: Address missing in ingress" \
 && make log/nginx-ingress
	-grep "${host}" /etc/hosts

status/all:
	${k8s}.status --wait-ready
	-${kubectl} get all
	-${kubectl} get all --all-namespaces
	-${kubectl} get ingress.extensions

${k8s}/start:
	${k8s}.start
	${k8s}.status --wait-ready

load: help spec import enable apply ingress
	@echo "# log: $@: $^"

start: ${k8s}/start load
	@echo "# log: $@: $^"

stop:
	${k8s}.stop

run: apply status proxy client
	@echo "# make status proxy"
	@echo "# make status ingress"
	@echo "# make status host"
	@echo "# make status client"

demo: delete start
	${MAKE} run \
 || echo "# log: may be failed, try again: make status run"
	@echo "# log: $@: $^"

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

delete/src:
	rm -fv deployment.yml service.yml ${name}.yml

delete/run:
	-${kubectl} delete service/${name}
	-${kubectl} delete deployment.apps/${name}
	-${kubectl} delete ingress.extensions/${name}
	${k8s}.status --wait-ready

reset: delete
	${k8s}.status --wait-ready
	-${k8s}.disable ingress
	-${k8s}.disable dns
	-${k8s}.disable registry
	yes | ${k8s}.reset --destroy-storage
	${k8s}.status --wait-ready

delete: delete/src delete/run
	@echo "# log: $@: $^"

log/%:
	${k8s}.status --wait-ready
	pod=$(shell ${kubectl} get all | grep -o "pod/${@F}-[^ ]*" || echo "pod/TODO/$@" | head -n 1) \
 && echo "# log: pod=$${pod}" \
 && ${kubectl} describe "$${pod}" \
 && ${kubectl} logs "$${pod}"

log/pod: log/${name}
	${kubectl} get all --all-namespaces | grep "pod/${name}"

log/nginx-ingress:
	${kubectl} get all --all-namespaces | grep "pod/${@F}-"

log: log/pod log/nginx-ingress
	@echo "# log: $@: $^"

/etc/docker/daemon.json:
	echo '{ "insecure-registries" : ["localhost:32000"] }' | ${sudo} tee -a $<

iptables:
	${sudo} iptables -P FORWARD ACCEPT
	${sudo} iptables -L


uninstall:
	-${MAKE} delete
	-${MAKE} reset
	-${NAKE} stop
	${sudo} ${snap} remove ${k8s}
	${sudo} iptables -L
	@echo "sudo iptables -F # Could help too"

purge: stop ${k8s}/start delete reset stop uninstall backup
	sync

backup: stop
	${sudo} mv ${HOME}/.kube ${HOME}/.kube._$(shell date -u +"%Y%m%d_%s").bak
	${sudo} mv ${HOME}/snap/microk8s ${HOME}/snap/microk8s._$(shell date -u +"%Y%m%d_%s").bak
	-${sudo} du -hsc /var/snap/microk8s/*
	-${sudo} mv /var/snap/microk8s /var/snap/microk8s._$(shell date -u +"%Y%m%d_%s").bak

version:
	snap info ${k8s}
	cat /proc/cpuinfo
