# SS graph tool

An external dialogue graph visualization tool for project SS.

<!-- TOC -->

- [SS graph tool](#ss-graph-tool)
    - [Developing](#developing)
    - [Building](#building)
        - [Cleaning built files](#cleaning-built-files)
    - [Notes](#notes)
    - [Linting](#linting)

<!-- /TOC -->

## Developing

Follow these steps to set up the project locally:

1. Prerequisites

    Have the following installed:

    - Node.js (v24.10.0 recommended) and npm or pnpm
    - Rust toolchain (stable)
    - Tauri prerequisites:
        - Windows: Visual Studio with “Desktop development with C++” workload
        - macOS: Xcode Command Line Tools
        - Linux: libwebkit2gtk-4.0-dev, build-essential, pkg-config, curl
1. Install frontend dependencies
    ```
    pnpm install
    ```
    or
    ```
    npm install
    ```
    or equivalent.

1. Run the development server
    ```
    pnpm run tauri:dev
    ```
    or equivalent for `npm` etc.

    Then:
    - The Svelte app will be served locally (usually http://localhost:5173/ by default)
    - The Tauri window will open automatically
    - Any changes you make to Svelte or Rust code will hot-reload

## Building

To create a production version:

```sh
pnpm run tauri:build
```

or equivalent for `npm` etc.

Output binaries will be in src-tauri/target/release/

The app is self-contained; users do not need Node.js or Rust installed.

### Cleaning built files

If want to clean intermediate files, built files and artifacts, use a script defined in package.json like this:

```
pnpm tauri:clean
```

## Notes

- Node positions and layout are persisted automatically to a local JSON file via Tauri
- For frontend-only testing, you can run:
    ```
    pnpm dev
    ```
    or equivalent for `npm` etc.

## Linting

No very good linter for Svelte 5. Currently using ESlint for only js files. So the *eslint.config.js* has ignore rules for both .ts and .svelte.

Lint js files:
```
pnpm exec eslint src --ext .js
```

. Lint .ts files:
```
pnpm exec tsc --noEmit
```

. Prettier is also installed and can be used to auto format by running:
```
pnpm exec prettier --write .
```

, but I personally don't want to use it.
