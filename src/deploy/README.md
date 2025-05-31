# DecentAppsNet/deploy

This repository contains the built output of the "DecentAppsNet/deploy" GitHub Action. Its source code is maintained in the [DecentAppsNet/decent-actions monorepo](https://github.com/DecentAppsNet/decent-actions).

Each action has its own repository like this one to allow clean and simple use with the uses: field in GitHub Actions workflows. This repo is intentionally limited to build artifacts only — source code and history are managed centrally.

# Action Usage

This GitHub Action deploys your app to a **staging environment** on [decentapps.net](https://decentapps.net). It recursively uploads files from the `dist` folder located at the project root.

It’s the responsibility of the calling workflow to populate this folder, typically by checking out the code and running build steps in the GitHub CI environment.

The required API key and app name are provided during your provisioning process with Decent Apps.

## Inputs

| Name       | Required | Description                              |
|------------|----------|------------------------------------------|
| `api-key`  | ✅ Yes    | Decent API key used for authentication.  |
| `app-name` | ✅ Yes    | The name of the app being deployed.      |

# Support / Filing Issues

Use the [create-decent-app issue tracker](https://github.com/DecentAppsNet/create-decent-app/issues) rather than the issue tracker on this repo.

# Contact

For support and bugs, please use the issue tracking link mentioned above. For other things, you can email us at info@decentapps.net.