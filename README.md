# DecentAppsNet/decent-actions

This monorepo contains source code for Github actions used for deployment on the [Decent Portal](https://decentapps.net). Individual actions are deployed separately to subrepos to support a clean naming convention like "DecentAppsNet/deploy" or "DecentAppsNet/promote" inside of consuming workflows.

You're welcome to use this project however you like, but most people won't find it useful unless:

* You're building a Decent app using the [create-decent-app code generator](https://github.com/erikh2000/create-decent-app).
* You want that app to deploy to the [Decent Portal](https://decentapps.net).
* Your app has been approved for portal hosting and you've received the necessary deployment secrets/credentials.

If all of the above apply and you're just looking to get things working, the [create-decent-app documentation](https://github.com/erikh2000/create-decent-app) has all the setup instructions you need.

# Support for this Repository

Yes, this is open source, but this repo functions more like a dependency than a standalone project. It’s not tracked or maintained in the usual open source fashion. Please use the [create-decent-app repository](https://github.com/erikh2000/create-decent-app) for issues, documentation, and support.

# Security Concerns

I always welcome feedback. But on security, I double-welcome it! Please feel free to [open an issue](https://github.com/erikh2000/create-decent-app/issues) or contact me if you have any suggestions.

# Development and Deployment

These are more notes for myself to keep track of how I set up the project.

* No dependencies other than those built in to Node.
* Debugging directly against the typescript files (rather than the bundled JS) can be accomplished with node v23 or later.
* The debugger will need some environment variables set up. See comments in index.ts for each one.
* Breakpoints work a little unreliably with the experimental type stripping in Node v24. Add `debugger` JS statement if needed.

# Licensing

This repository is licensed under the MIT License.

# Contacting

You can reach me via my LinkedIn profile. I'll accept connections if you will just mention "decent apps" or some other shared interest in your connection request.

-Erik Hermansen