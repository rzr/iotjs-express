# IOTJS-EXPRESS #

[![GitHub forks](
https://img.shields.io/github/forks/rzr/iotjs-express.svg?style=social&label=Fork&maxAge=2592000
)](
https://GitHub.com/rzr/iotjs-express/network/
)
[![license](
https://img.shields.io/badge/license-MIT-0.svg
)](MIT)
[![Build Status](
https://travis-ci.org/rzr/iotjs-express.svg?branch=master
)](
https://travis-ci.org/rzr/iotjs-express
)
[![NPM](
https://img.shields.io/npm/v/iotjs-express.svg
)](
https://www.npmjs.com/package/iotjs-express
)
[![IRC Channel](
https://img.shields.io/badge/chat-on%20freenode-brightgreen.svg
)](
https://kiwiirc.com/client/irc.freenode.net/#tizen
)
[![Docker Pulls](
https://img.shields.io/docker/pulls/rzrfreefr/iotjs-express.svg
)](
https://cloud.docker.com/repository/docker/rzrfreefr/iotjs-express
)
[![Automated Builds](
https://img.shields.io/docker/cloud/automated/rzrfreefr/iotjs-express.svg
)](
https://cloud.docker.com/repository/docker/rzrfreefr/iotjs-express/timeline
)
[![Build Status](
https://img.shields.io/docker/cloud/build/rzrfreefr/iotjs-express.svg
)](
https://cloud.docker.com/repository/docker/rzrfreefr/iotjs-express/builds
)
[![codebeat badge](
https://codebeat.co/badges/b9167a25-1c70-4aad-8d32-2a08eb253e6e
)](
https://codebeat.co/projects/github-com-rzr-iotjs-express-master
)
[![Codacy Badge](
https://api.codacy.com/project/badge/Grade/7fe74bd1d67d445888268a2eb48e7d6e
)](
https://app.codacy.com/app/rzr/iotjs-express?utm_source=github.com&utm_medium=referral&utm_content=rzr/iotjs-express&utm_campaign=Badge_Grade_Dashboard
)
[![CII Best Practices](
https://bestpractices.coreinfrastructure.org/projects/3297/badge
)](
https://bestpractices.coreinfrastructure.org/projects/3297
)


[![NPM](
https://nodei.co/npm/iotjs-express.png
)](
https://npmjs.org/package/iotjs-express
)

## INTRODUCTION: ##

While ExpressJs claims to be minimalist,
many dependencies are required and thus can't support IoT.js runtime
(powered by JerryScript an alternative engine for MicroControllers).

Instead of porting the whole project to older ECMA standards, 
basic routing was re-implemented, and API tried to be preserved.

Originally this module was done for "webthing-iotjs" project,
a library to build webthings to connect to Mozilla's IoT gateway.

Source file was bundled into project, but then pulled out as this standalone module,
which can be used by both runtime Node.Js and IoT.js.

[![Presentation](https://image.slidesharecdn.com/webthing-iotjs-20181022rzr-181027220201/95/webthingiotjs20181027rzr-17-638.jpg)](https://www.slideshare.net/rzrfreefr/webthingiotjs20181022rzr-120959360/# "WebThingIotJs")

## USAGE WITH IOTJS ##

```sh
mkdir iotjs_modules
git clone https://github.com/rzr/iotjs-express iotjs_modules/iotjs-express 
cd iotjs_modules/iotjs-express
make start &
#| iotjs example

curl -i http://localhost:8080/.well-known/security.txt
#| HTTP/1.1 200 OK
#| access-control-allow-origin: *
#| access-control-allow-headers: Origin, X-Requested-With, Content-Type, Accept
#| access-control-allow-methods: GET, HEAD, PUT, POST, DELETE
#| 
#| Contact: https://www.npmjs.com/~rzr

curl -i http://localhost:8080/favicon.ico
#| HTTP/1.1 404 Not Found
#| content-length: 23
#| Error: 404 (Not Found)

curl -i http://localhost:8080/~rzr
#| {"user":"rzr"}

curl -X PUT -d '{"value":42}' http://localhost:8080/db/some-key
#| {"some-key":42}

curl -X PUT -d '{"value":1984}' http://localhost:8080/db/some-other-key
#| {"some-key":42,"some-other-key":1984}

curl -i  http://localhost:8080/static/README.md  
#| HTTP/1.1 200 OK
#| # IOTJS-EXPRESS #
#| (...)
```

[![iotjs_modules](https://image.slidesharecdn.com/webthing-iotjs-tizenrt-cdl2018-20181117rzr-181118110813/95/webthingiotjstizenrtcdl201820181117rzr-24-638.jpg)](https://www.slideshare.net/rzrfreefr/webthingiotjstizenrtcdl201820181117rzr/24 "iotjs_modules")

## USAGE WITH NODE ##

It's mostly the same:

```sh
npm install iotjs_express
cd node_modules/iotjs-express
npm start
# Or:
make start runtime=node
#| node example
```

## USAGE WITH DOCKER ##

```sh
docker run --net host rzrfreefr/iotjs-express:latest
curl http://localhost:8080/.well-known/security.txt
#| Contact: https://www.npmjs.com/~rzr

# Or from sources
docker-compose up
curl http://localhost:8080/.well-known/security.txt
#| Contact: https://www.npmjs.com/~rzr
```

## USAGE WITH MINIKUBE ##

```sh

name="iotjs-express"
url="https://raw.githubusercontent.com/rzr/iotjs-express/master/extra/tools/kube/$name.yml"
url=https://raw.githubusercontent.com/rzr/iotjs-express/sandbox/rzr/devel/master/extra/tools/kube/$name.yml
kubectl=kubectl

minikube version

minikube start || minikube logs --alsologtostderr 

$kubectl version

$kubectl apply -f "${url}"
#| deployment.extensions/iotjs-express created
#| service/iotjs-express created

time minikube service ${name} --url
#| http://192.168.99.102:30080
time minikube service ${name}
#| 🎉  Opening kubernetes service default/iotjs-express in default browser...
```

## USAGE WITH K3S ##

```sh
project="iotjs-express"
image="rzrfreefr/${project}:latest"
kubectl="sudo kubectl"

sudo sync
sudo snap remove microk8s
curl -sfL https://get.k3s.io | sh - # v0.7.0
sudo systemctl restart k3s.service || sudo systemctl status k3s.service

$kubectl get nodes # Wait "Ready state"
#| {host}   NotReady   master   5s    v1.14.4-k3s.1
#| (...)
#| {host}   Ready    master   51s   v1.14.4-k3s.1

$kubectl run "${project}" --image="${image}"

$kubectl get all --all-namespaces | grep "$project"
#| default       pod/iotjs-express-..........-.....   1/1     Running     0          ..s

pod=$($kubectl get all --all-namespaces \
  | grep -o "pod/${project}.*" | cut -d/ -f2 | awk '{ print $1}' \
  || echo failure) && echo pod="$pod"
$kubectl describe pod "$pod"  | grep 'Status:             Running'
ip=$($kubectl describe pod "$pod" | grep 'IP:' | awk '{ print $2 }') && echo "ip=${ip}"

curl http://$ip:8080/.well-known/security.txt
```

## DEMO ##

In "webthing-iotjs-20180621rzr" video,
Edison's running a webthing server powered by iotjs-express framework to build routes,
(it relies on IoT.js's http module, API is aligned to node)

[![webthing-iotjs-20180621rzr](https://camo.githubusercontent.com/8892251f72dae9fa1c508da8abc33cbc2f6a0e75/68747470733a2f2f732d6f70656e736f757263652e6f72672f77702d636f6e74656e742f75706c6f6164732f323031382f30362f7765627468696e672d696f746a732d3230313830363231727a722e676966#webthing-iotjs-20180621rzr.gif)](https://www.slideshare.net/rzrfreefr/webthingiotjs20181022rzr-120959360/41#webthing-iotjs-20180621rzr "Demo")

*   <https://player.vimeo.com/video/276279690#webthing-iotjs-20180621rzr>

Demo also shows following systems:

- Edison: iotjs-express + webthing-iotjs on Jubilinux (Debian fork).
- RaspberryPi: mozilla-iot-gateway + express.js on Raspbian
- Galaxy note: SamsungInternet web browser for Android.

## EXTRA EXAMPLES ##

```sh
iotjs example/client.js 8080 localhost /.well-known/security.txt
Contact: https://www.npmjs.com/~rzr
```

An extra example is added to show how to make a bridge from HTTP/REST to MQTT.

## RESOURCES ##

*   <https://glitch.com/edit/#!/samsunginternet-iotjs-express>
*   <https://samsunginternet-iotjs-express.glitch.me/.well-known/security.txt>
*   <https://www.npmjs.com/browse/depended/iotjs-express>
*   <http://expressjs.com/>
*   <https://www.npmjs.com/package/express>
*   <https://en.wikipedia.org/wiki/Express.js>
*   <https://iotjs.net/>
*   <https://github.com/rzr/webthing-iotjs/wiki/IotJs>
*   <https://github.com/pando-project/iotjs/blob/master/docs/api/IoT.js-API-HTTP.md>
*   <https://github.com/jerryscript-project>
*   <https://nodejs.org/api/http.html>
*   <https://tools.ietf.org/html/rfc2616>
*   <https://en.wikipedia.org/wiki/Representational_state_transfer>
*   <https://github.com/rzr/webthing-iotjs/wiki>
*   <https://libraries.io/npm/iotjs-express>
*   <https://github.com/runtimejs/runtime/issues/151#> (Open)
*   <https://github.com/rzr/webthing-iotjs/wiki/Kube>
*   <https://github.com/the-benchmarker/web-frameworks/issues/1643> (Merged)
*   <https://www.openhub.net/p/iotjs-express>
*   <https://microbadger.com/images/rzrfreefr/iotjs-express>
