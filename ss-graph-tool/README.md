# SS graph tool

An external dialogue graph visualization tool for project SS.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

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
