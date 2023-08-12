# nicholaschiasson.github.io [![build status](https://github.com/nicholaschiasson/nicholaschiasson.github.io/actions/workflows/main.yml/badge.svg)](https://github.com/nicholaschiasson/nicholaschiasson.github.io/actions)

My personal website and portfolio.

See it live here: https://nicholaschiasson.github.io

# Development

## Prerequisites

- [nix](https://nixos.org/download.html)
- [nix flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes)

## How-to

Create the development shell environment.

```shell
nix develop
```

Build the site, compiling tailwind css and running templating engine.

```shell
just build
```

Validate the formatting of html, css, and javascript files in the repo.

```shell
just check
```

Fix the formatting of html, css, and javascript files in the repo.

```shell
just format
```

Run linter for javascript files in the repo.

```shell
just lint
```

Watch source and rebuild on changes.

```shell
just watch
```

Serve the site locally, rebuilding on changes.

```shell
just serve
```

Both the `serve` and `watch` tasks ultimately invoke the `build` task (`serve` invokes `watch`). The `build` task does several things but ultimately outputs files to the `dist/` directory at the root of this project. The `build` task does not wipe the `dist/` directory during its execution, so as long as you don't overwrite a file in the source, it will remain in `dist/` until you delete it. If you're too lazy to run `rm -rf dist`, you can instead run `just clean`.

The `check` and `format` tasks invoke `prettier`.

The `lint` task invokes `eslint`.

> [!NOTE]
> Currently, the `lint` task is not entirely useful due to default rules and how the javascript is written. For this reason, it is not run by CI. This should be fixed in the future.

# TO DO

- [ ] Parallaxing backgrounds
- [ ] Donation
