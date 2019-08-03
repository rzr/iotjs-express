name?=iotjs-express

${name}.yml: deployment.yml service.yml Makefile
	@echo > $@
	@echo '---'  >> $@
	cat deployment.yml >> $@
	@echo '---'  >> $@
	cat service.yml >> $@
	@echo '---'  >> $@
