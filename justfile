build:
    mkdir -p dist
    cp -rf src/* rsrc dist/
    gomplate --input-dir=dist --output-dir=dist --include=**/*.{html,css}
    tailwindcss -i dist/rsrc/stylesheets/default.css -o dist/rsrc/stylesheets/default.css

[private]
prettier *ARGS:
    prettier **/*.{html,css,js,json,md,yaml,yml} --no-error-on-unmatched-pattern {{ARGS}}

check: (prettier "-c")

format: (prettier "-w")

lint:
    eslint .

clean:
    rm -rf dist

watch:
    watchexec -w src -w rsrc -w templates just build

serve: build
    miniserve dist --index=index.html &
    just watch
