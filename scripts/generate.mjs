// Copyright (c) Tribufu. All Rights Reserved.
// SPDX-License-Identifier: MIT

import { mkdtemp, readFile, writeFile, rm, rmdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const spec = process.argv[2] ?? "https://api.tribufu.com/openapi.json";
let schema;
if (spec.startsWith("https://")) {
    const response = await fetch(spec);
    if (!response.ok) throw new Error(`OpenAPI request failed (${response.status})`);
    schema = await response.json();
} else {
    schema = JSON.parse(await readFile(spec, "utf8"));
}
schema.servers = [{ url: "https://api.tribufu.com" }];
const directory = await mkdtemp(join(tmpdir(), "tribufu-openapi-"));
const schemaFile = join(directory, "openapi.json");
try {
    await writeFile(schemaFile, JSON.stringify(schema));
    const args = [
        "-i",
        schemaFile,
        "-g",
        "typescript-fetch",
        "-o",
        ".",
        "--global-property",
        "apis,models,supportingFiles,apiDocs=false,modelDocs=false,apiTests=false,modelTests=false",
        "--additional-properties=modelPackage=models,apiPackage=api,npmName=tribufu,prettier=true,useSingleRequestParameter=false",
        "--openapi-normalizer",
        "SET_TAGS_FOR_ALL_OPERATIONS=TribufuGenerated",
        "--skip-validate-spec",
    ];
    const result = spawnSync(
        process.execPath,
        [require.resolve("@openapitools/openapi-generator-cli/main.js"), "generate", ...args],
        {
            cwd: fileURLToPath(new URL("../", import.meta.url)),
            stdio: "inherit",
        },
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
} finally {
    await rm(schemaFile, { force: true });
    await rmdir(directory);
}
