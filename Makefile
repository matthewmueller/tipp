example:
	@./node_modules/.bin/roo example/index.js example/index.css

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec

.PHONY: example
