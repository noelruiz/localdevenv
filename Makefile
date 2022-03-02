build:
	@docker build -t mynodeapp:0.0.1 .

run:
	@docker-compose up

stop:
	@docker-compose stop

magic: build \
	run

PHONY: build run stop
