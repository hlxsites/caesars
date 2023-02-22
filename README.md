# Caesars.com

Caesars Palace on Franklin.

## Environments
- Preview: https://main--caesars--hlxsites.hlx.page/
- Live: https://main--caesars--hlxsites.hlx.live/

## Installation
Install all dependencies locally.

```sh
npm i
```

## Tests

```sh
npm test
```

## Lint
Ensure all code and styles match linting rules.

```sh
npm lint
```

## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Franklin Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `caesars` directory in your favorite IDE and start coding 🙂
