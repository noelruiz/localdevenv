build:
	@docker build -t mynodeapp:0.0.1 .

run:
	@docker-compose up

stop:
	@docker-compose stop

PHONY: build run stop
