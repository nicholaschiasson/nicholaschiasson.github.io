build:
    mkdir -p dist
    cp -rf src/* rsrc dist/
    npx tailwindcss -i rsrc/stylesheets/default.css -o dist/rsrc/stylesheets/default.css
    find dist -name *.html | while read f; do YEAR=$(date +%Y) envsubst -i "${f}" -o "${f}"; done

clean:
    rm -rf dist

watch:
    watchexec -w src -w rsrc just build

serve: build
    miniserve dist --index=index.html &
    just watch
