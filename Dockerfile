#!/bin/echo docker build . -f
# -*- coding: utf-8 -*-
# SPDX-License-Identifier: MIT
#{
# Copyright 2019-present Samsung Electronics France SAS, and other contributors
#
# This Source Code Form is subject to the terms of the MIT Licence
# If a copy of the MIT was not distributed with this file
# You can obtain one at:
# https://spdx.org/licenses/MIT.html
#}

FROM debian:10
LABEL maintainer "Philippe Coval (rzr@users.sf.net)"

ENV DEBIAN_FRONTEND noninteractive
ENV LC_ALL en_US.UTF-8
ENV LANG ${LC_ALL}

RUN echo "#log: Configuring locales" \
  && set -x \
  && apt-get update -y \
  && apt-get install -y locales \
  && echo "${LC_ALL} UTF-8" | tee /etc/locale.gen \
  && locale-gen ${LC_ALL} \
  && dpkg-reconfigure locales \
  && sync

RUN echo "#log: Setup system" \
  && set -x \
  && apt-get update -y \
  && apt-get install -y \
     sudo apt-transport-https make curl git \
  && apt-get clean \
  && sync

ENV project iotjs-express
COPY . /usr/local/opt/${project}/src/${project}/
WORKDIR /usr/local/opt/${project}/src/${project}/
RUN echo "#log: Install iotjs" \
  && set -x \
  && make setup \
  && apt-get clean \
  && sync

RUN echo "#log: ${project}: Preparing sources" \
  && set -x \
  && make help \
  && make \
  && make check \
  && sync

EXPOSE 8080
WORKDIR /usr/local/opt/${project}/src/${project}/
ENTRYPOINT [ "/usr/bin/make" ]
CMD [ "start" ]
