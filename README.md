# nicholaschiasson.github.io [![build status](https://github.com/nicholaschiasson/nicholaschiasson.github.io/actions/workflows/main.yml/badge.svg)](https://github.com/nicholaschiasson/nicholaschiasson.github.io/actions)

My personal website, portfolio, and blog.

See it live here: https://nicholas.chiasson.dev

# Development

This project supports two development paths:

- Docker / Docker Compose: fully containerized dev environment.
- Mise: local toolchain manager with pinned versions in [mise.toml](mise.toml).

## Environment

Create a `.env` file at the project root. These variables are used to fetch blog data from GitHub during the build.

```shell
export GITHUB_GRAPHQL_URL="https://api.github.com/graphql"
export GITHUB_REPOSITORY_OWNER="nicholaschiasson"
export GITHUB_TOKEN="<insert auth token here>"
```

The `justfile` is configured with `dotenv-load`, so `.env` is automatically loaded for local runs. The Docker Compose setup also loads `.env`.

## Option A: Docker Compose

Make sure Docker is installed and run:

```shell
docker compose up --build
```

This builds the image from [Dockerfile](Dockerfile), starts `just serve` via [docker-compose.yaml](docker-compose.yaml), mounts the repo, and serves at http://localhost:8080 with live rebuilds.

### Run one-off tasks with `docker compose run`

You can execute any `just` task in a one-off container, without starting the long-running `serve` service:

```shell
# Basic one-off tasks
docker compose run --rm app just build
docker compose run --rm app just check
docker compose run --rm app just format
docker compose run --rm app just lint

# Watch tasks (interactive)
docker compose run --rm -it app just watch

# Serve with ports exposed via run (otherwise prefer `up`)
docker compose run --rm --service-ports app just serve
```

Tips:

- `--rm`: removes the container when the task completes.
- `-it`: attaches an interactive TTY (useful for `watch`).
- `--service-ports`: binds the service’s ports (e.g., 8080) for `serve`.
- Env vars: compose already loads `.env` via `env_file`, but you can override with `-e NAME=value`.

## Option B: Mise

Install [mise](https://mise.jdx.dev/) and then:

```shell
mise install
just serve
```

This installs the exact tool versions declared in [mise.toml](mise.toml) (e.g., `deno`, `just`, `gomplate`, `jaq`, `wasm-pack`, `miniserve`, `watchexec`, Tailwind CLI).

> [!IMPORTANT]
> When using Mise, install `ffmpeg` yourself and ensure it includes WebP support (`libwebp`). Mise does not configure `ffmpeg` with `libwebp`, and the build step that processes WebP images requires it.
>
> Verify your `ffmpeg` supports WebP:
>
> ```shell
> ffmpeg -codecs | grep -E 'webp|libwebp'
> ```
>
> You should see encode/decode entries for WebP. If not, install `ffmpeg` from a source that includes `libwebp` (for example, your distro’s packaged `ffmpeg` with WebP enabled).

## Tasks & Workflow

Common `just` tasks:

- Build:

  ```shell
  just build
  ```

  Compiles Tailwind CSS, runs templating, processes assets, and outputs to `dist/`.

- Check (format validation):

  ```shell
  just check
  ```

  Runs Prettier in check mode and project checks for `life/`.

- Format (apply fixes):

  ```shell
  just format
  ```

  Runs Prettier in write mode and formatting for `life/`.

- Lint:

  ```shell
  just lint
  ```

  Uses `deno lint` for JS/TS and linting for `life/`.

- Watch and rebuild on changes:

  ```shell
  just watch
  ```

- Serve locally (rebuilds on change):
  ```shell
  just serve
  ```

Notes:

- `serve` invokes `watch`, and both ultimately run `build`.
- `build` writes to `dist/` and does not clear it; use `just clean` to remove `dist/`, `.cache/`, and `node_modules/`.
