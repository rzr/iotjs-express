name?=iotjs-express

${name}.yml: deployment.yml service.yml Makefile
	@echo > $@
	cat deployment.yml >> $@
	@echo '---'  >> $@
	cat service.yml >> $@
	@echo '---'  >> $@
