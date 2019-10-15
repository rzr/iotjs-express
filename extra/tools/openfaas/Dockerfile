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

FROM rzrfreefr/iotjs-express:latest
LABEL maintainer "Philippe Coval (p.coval@samsung.com)"

ENV project iotjs-express-openfaas
COPY . /usr/local/opt/${project}/src/${project}/
WORKDIR /usr/local/opt/${project}/src/${project}/

ADD https://github.com/openfaas/faas/releases/download/0.6.9/fwatchdog /usr/bin
RUN chmod +x /usr/bin/fwatchdog

ENV read_timeout="60"
ENV write_timeout="60"
ENV fprocess="xargs iotjs --help"

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1
CMD [ "fwatchdog" ]
