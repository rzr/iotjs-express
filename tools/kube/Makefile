name?=iotjs-express

${name}.yml: deployment.yml service.yml Makefile
	@echo "%YAML 1.2" > $@
	@echo '---'  > $@
	cat deployment.yml >> $@
	@echo '---'  > $@
	cat service.yml >> $@
	@echo '---'  > $@
