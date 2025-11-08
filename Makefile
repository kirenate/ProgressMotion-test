infra-run:
	docker compose -f docker-compose-infra.yaml up -d

no-ssl:
	docker compose -f docker-compose-nossl.yaml up -d --build