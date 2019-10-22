# -*- mode: ruby -*-
# vi: set ft=ruby :
# SPDX-License-Identifier: MIT
#{
# Copyright 2019-present Samsung Electronics France SAS, and other contributors
#
# This Source Code Form is subject to the terms of the MIT Licence
# If a copy of the MIT was not distributed with this file
# You can obtain one at:
# https://spdx.org/licenses/MIT.html
#}

Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/bionic64"
  config.vm.network "forwarded_port", guest: 8080, host: 8080, host_ip: "127.0.0.1"
  config.vm.synced_folder ".", "/usr/local/opt/iotjs-express"
  config.vm.provider "virtualbox" do |vb|
      vb.memory = "512"
  end
  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y make
    make -C /usr/local/opt/iotjs-express setup
    make -C /usr/local/opt/iotjs-express start
  SHELL
end
