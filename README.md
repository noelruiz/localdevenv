# localdevenv

* Sample on a docker-ized local nodejs application environment
* `sample.js` is a simple redis demo that can be used to create and read records in redis
* these records contain a ttl

## usage

* build the app image `make build`
* run the stack `make run`
* on a second terminal, you can stop it if needed `make stop`

## redis records

* [local URL](http://localhost:8001/v1/tokens)
* Inserting a record through curl
```bash
curl -XPOST http://localhost:8001/v1/token/n1
```
* Reading all records via curl
```bash
curl -XGET http://localhost:8001/v1/tokens
```
* Reading records from `redis-cli`
```bash
docker exec -ti redis redis-cli get n1
docker exec -ti redis redis-cli ttl n1
docker exec -ti redis redis-cli keys "*"
```
