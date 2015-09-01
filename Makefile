example:
	@./node_modules/.bin/roo example/index.js example/index.css

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec

dist: dist-library dist-minify

dist-library:
	@mkdir -p dist
	@./node_modules/.bin/browserify -t browserify-string-to-js index.js -s tipp --outfile dist/tipp.js

dist-minify: dist/tipp.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://marijnhaverbeke.nl/uglifyjs \
		> $<.tmp
	@mv $<.tmp dist/tipp.min.js

.PHONY: example dist
