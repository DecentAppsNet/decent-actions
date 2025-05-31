# DecentAppsNet/rollback

This repository contains the built output of the "DecentAppsNet/rollback" GitHub Action. Its source code is maintained in the [DecentAppsNet/decent-actions monorepo](https://github.com/DecentAppsNet/decent-actions).

Each action has its own repository like this one to allow clean and simple use with the uses: field in GitHub Actions workflows. This repo is intentionally limited to build artifacts only — source code and history are managed centrally.

# Action Usage

This GitHub Action rolls back your to the **production environment** on [decentapps.net](https://decentapps.net), to the previous production version. You can only roll back once per promotion. A second rollback attempt (without a new promotion) will fail. Once a new version is promoted, rollback becomes available again.

The required API key and app name are provided during your provisioning process with Decent Apps.

## Inputs

| Name       | Required | Description                              |
|------------|----------|------------------------------------------|
| `api-key`  | ✅ Yes    | Decent API key used for authentication.  |
| `app-name` | ✅ Yes    | The name of the app being rolled back.   |

# Support / Filing Issues

Use the [create-decent-app issue tracker](https://github.com/DecentAppsNet/create-decent-app/issues) rather than the issue tracker on this repo.