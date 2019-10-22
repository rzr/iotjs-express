#!/bin/sh
#                                                              -*- Mode: Sh -*-
# SPDX-License-Identifier: MIT
#{
# Copyright 2019-present Samsung Electronics France SAS, and other contributors
#
# This Source Code Form is subject to the terms of the MIT Licence
# If a copy of the MIT was not distributed with this file
# You can obtain one at:
# https://spdx.org/licenses/MIT.html
#}
set -e
sudo sync

sudo apt-get update -y
sudo apt-get install -y base-files gnupg

apt-cache show iotjs || echo "TODO: iotjs is in debian:testing !"
dpkg-architecture || :

. /etc/os-release


distro="${ID}_${VERSION_ID}"
[ "debian" != "${ID}" ] || distro="${distro}.0"
[ "debian_10.0" != "${distro}" ] || distro="${ID}_${VERSION_ID}"
distro=$(echo "${distro}" | sed 's/.*/\u&/')
[ "ubuntu" != "${ID}" ] || distro="x${distro}"

url="http://download.opensuse.org/repositories/home:/rzrfreefr:/snapshot/$distro"
file="/etc/apt/sources.list.d/org_opensuse_home_rzrfreefr_snapshot.list"

curl -s "${url}/Release.key" | gpg --with-fingerprint
curl "${url}/Release.key" | sudo apt-key add -v -

echo "deb [allow-insecure=yes] $url /" | sudo tee "${file}"
sudo apt-get update -y
apt-cache search --full iotjs

version=$(apt-cache show "iotjs-snapshot" \
              | grep 'Version:' | cut -d' ' -f2 | sort -n | head -n1 \
              || echo 0)

sudo apt-get install \
     --yes \
     --allow-downgrades \
     --allow-unauthenticated \
     iotjs="${version}" \
     iotjs-snapshot="${version}" \
     #EOL

which iotjs
iotjs -h || echo "log: iotjs's usage expected to be printed before"

file=$(mktemp)
echo 'console.log(JSON.stringify(process))' > "$file"
iotjs "$file"
rm -f -- "$file"
