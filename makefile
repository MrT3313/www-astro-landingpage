phony: i ri

# PACKAGES ####################################################################
i:
	npm install

ri:
	rm -rf node_modules package-lock.json
	make i

# DEVELOPMENT #################################################################
dev:
	npm run dev