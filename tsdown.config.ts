// Copyright (c) Tribufu. All Rights Reserved.
// SPDX-License-Identifier: MIT

import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    platform: "neutral",
    target: "es2022",
    outDir: "build",
    fixedExtension: true,
    dts: true,
    banner: "// Copyright (c) Tribufu. All Rights Reserved.\n// SPDX-License-Identifier: MIT",
});
