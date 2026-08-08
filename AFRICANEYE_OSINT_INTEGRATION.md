# AfricanEye Intelligence Map Integration

## Repository boundary

- `BlackSurvivalGear/AfricanEye` is the destination repository.
- `BlackSurvivalGear/AfrOsint` is a protected source/reference repository and is not modified by this integration.

## Current implementation

`africaneye-osint.html` provides the AfricanEye-hosted intelligence-map webapp entry point. It loads the existing AfrOsint frontend presentation into an isolated sandbox, removes Firebase/authentication script dependencies before rendering, exposes the app as **AfricanEye Intelligence Map**, and replaces user-facing AfrOsint branding with AfricanEye.

## Backend boundary

The integration deliberately removes the Firebase application/authentication/storage script tags and the AfrOsint authentication loading screen. No AfrOsint backend is copied into AfricanEye.

## Next hardening step

The current branch is an integration stage. The final production implementation should vendor the required static frontend assets and client-side modules into AfricanEye so the module no longer depends on the source repository at runtime. This should be done without modifying the protected AfrOsint repository.
