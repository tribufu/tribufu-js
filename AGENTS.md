# Agent Guidelines

These instructions apply to AI coding agents working in this project.

## Scope and implementation

- The user's request defines the scope. Make the smallest complete change that solves it; do not add unrelated features,
  refactors, cleanup, or speculative improvements.
- Inspect the relevant source files, nearby implementations, and project configuration. Read other documentation only
  when it helps with the requested task.
- Repository-specific rules live in the README, `CONTRIBUTING.md` and `docs/`, when present. Read the ones that
  cover the area you change.
- Follow the language, framework, and established patterns used in this project. When unsure, prefer nearby working code
  over introducing a new pattern.
- Do not invent APIs, configuration options, protocol behavior, or framework features. Verify them against the relevant
  official specification or language/framework documentation and the existing project code. If they cannot be verified,
  state what is uncertain instead of guessing.
- Reuse existing utilities and abstractions. Add a dependency or new abstraction only when necessary for the requested
  change.
- Preserve existing behavior and public contracts, including APIs, configuration, data formats, and schemas, unless
  changing them is part of the request.
- Never modify a submodule's contents or change its checked-out commit/reference.
- Avoid editing generated or third-party files unless they are the explicit target of the task.

## Security and dependencies

- Treat security and privacy as requirements. Do not expose secrets or sensitive data in source code, logs, errors, or
  test output.
- Do not weaken authentication, authorization, input validation, output encoding, transport security, or other existing
  protections to make a change work.
- Before adding or upgrading a dependency, confirm it is necessary and check its maintenance status, supported versions,
  known security advisories, and license compatibility with this project.
- Do not add dependencies that are unmaintained, have unresolved known vulnerabilities, or have an incompatible license.
  If any of these checks is unclear, do not add the dependency; report the uncertainty.

## Formatting

- Format every changed source file with the formatter configured for this project. If no formatter is configured, match
  the style of nearby code.
- Keep formatting changes limited to files touched for the task. Do not reformat unrelated code.

## Comments and API documentation

- Do not add comments that restate the code, explain obvious steps, or narrate the change.
- Add a source-code comment only when essential to explain a non-obvious reason, constraint, or workaround.
- Add documentation comments for public API functions or endpoints only when requested or required by the project's API
  documentation tooling or established convention. Document the public contract, not the implementation.

## README and other documentation

- Do not edit the README just to announce a code change or add a summary of the task.
- Update specific documentation only when requested or needed to keep setup instructions, configuration guidance, API
  documentation, or user-facing behavior accurate.
- Do not create documentation for its own sake or make unrelated documentation edits.

## Checks and tests

- Run the relevant existing formatter and the narrowest useful project check for changed code, such as a targeted test,
  type check, lint, or build.
- Add or update tests when the task changes behavior and the project has an appropriate existing test structure. Keep
  tests limited to the behavior changed.
- Do not invent validation commands, install tools just to run optional checks, or run broad suites unrelated to the
  change.
- If a relevant check cannot be run, say so. Report only checks that actually ran.

## Before finishing

- Review the diff for correctness, accidental formatting, comments, README edits, and unrelated changes.
- In the final response, briefly describe what changed and the checks that ran or could not be run.

## Environment files

NEVER delete a `.env` file, for any reason, in any variant (`.env`, `.env.local`, `.env.production`). This also covers
moving, renaming, overwriting or truncating one, and any `rm`, `git clean` or cleanup step whose path could reach one.
Do not copy one around, not even temporarily, and do not read its values. These files are ignored by Git and hold
secrets that may exist nowhere else, so a deleted one may be impossible to restore.

Never chain a destructive command after a `cd` that may have failed.
