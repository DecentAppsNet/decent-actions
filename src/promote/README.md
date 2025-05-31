# DecentAppsNet/promote

This repository contains the built output of the "DecentAppsNet/promote" GitHub Action. Its source code is maintained in the [DecentAppsNet/decent-actions monorepo](https://github.com/DecentAppsNet/decent-actions).

Each action has its own repository like this one to allow clean and simple use with the uses: field in GitHub Actions workflows. This repo is intentionally limited to build artifacts only — source code and history are managed centrally.

# Action Usage

This GitHub Action promotes your **staging deployment** to the **production environment** on [decentapps.net](https://decentapps.net), making it live at the production URL.

The required API key and app name are provided during your provisioning process with Decent Apps.

## Inputs

| Name       | Required | Description                              |
|------------|----------|------------------------------------------|
| `api-key`  | ✅ Yes    | Decent API key used for authentication.  |
| `app-name` | ✅ Yes    | The name of the app being promoted.      |

# Support / Filing Issues

Use the [create-decent-app issue tracker](https://github.com/DecentAppsNet/create-decent-app/issues) rather than the issue tracker on this repo.