# Tribufu JS

Open source JavaScript SDK for the public Tribufu API at `https://api.tribufu.com`.

[![NPM][npm-badge]][npm-url]
[![MIT License][mit-badge]][mit-url]
[![Discord Chat][discord-badge]][discord-url]

[npm-badge]: https://img.shields.io/npm/v/tribufu.svg
[npm-url]: https://www.npmjs.com/package/tribufu
[mit-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[mit-url]: https://github.com/tribufu/tribufu-js/blob/main/LICENSE.txt
[discord-badge]: https://img.shields.io/discord/276504514616623104.svg?logo=discord&style=flat-square
[discord-url]: https://www.tribufu.com/discord

[Website](https://www.tribufu.com) |
[Discord](https://www.tribufu.com/discord)

## Development

```sh
pnpm install
pnpm typecheck
pnpm build
```

Generate the client from the public API with `pnpm generate`. Its default schema is
`https://api.tribufu.com/openapi.json`; `pnpm generate <path-or-url>` selects another OpenAPI document.

## License

This project is licensed under the [MIT License].

[MIT License]: https://github.com/tribufu/tribufu-js/blob/main/LICENSE.txt
