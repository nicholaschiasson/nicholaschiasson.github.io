build: build_dist build_life build_posts
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
build_cache:
    mkdir -p .cache

[private]
build_dist:
    mkdir -p dist

build_life: build_dist
    just life/build --release -t no-modules --no-pack --no-typescript -d ${PWD}/dist/rsrc/wasm

build_posts: build_dist build_templates
    mkdir -p dist/posts
    jaq -c '.[]' ./.cache/blogPosts.json | while read -r post; do \
        echo "${post}" | gomplate -c 'post=stdin:///in.json' -f templates/blog-post.html -o "dist/posts/$(echo ${post} | jaq -r '.slug').html"; \
    done

build_templates: build_cache
    deno run \
        --allow-env="GITHUB_GRAPHQL_URL,GITHUB_REPOSITORY_OWNER,GITHUB_TOKEN" \
        --allow-net="api.github.com" \
        bin/fetchBlogPosts.js \
        > .cache/blogPosts.json

[private]
prettier *ARGS:
    prettier **/*.{html,css,js,json,md,yaml,yml} --no-error-on-unmatched-pattern {{ARGS}}

check: (prettier "-c") check_life

check_life:
    just life/check

format: (prettier "-w") format_life

format_life:
    just life/format

lint: lint_life
    deno lint .

lint_life:
    just life/lint

clean: clean_life
    rm -rf .cache dist

clean_life:
    just life/clean

watch:
    watchexec -w src -w rsrc -w templates -w life just build

serve: build
    miniserve dist --index=index.html &
    just watch
