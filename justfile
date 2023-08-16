build:
    mkdir -p dist
    cp -rf src/* rsrc dist/
    for f in $(find rsrc -name *.webp); do \
        for ar in 1920 1280 640 320 160 80; do \
            if ! [ -f dist/${f%.webp}-${ar}w.webp ]; then \
                ffmpeg -i ${f} -vf scale=${ar}:-1 dist/${f%.webp}-${ar}w.webp; \
            fi; \
        done; \
    done
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
