// Copyright (c) Tribufu. All Rights Reserved.
// SPDX-License-Identifier: MIT AND Apache-2.0

import dotenv from "dotenv";
import { TribufuApiFactory } from "../build/index.mjs";

dotenv.config();

async function main() {
    const tribufu = TribufuApiFactory.fromEnv();
    console.log(await tribufu.getServerMetrics());
    tribufu.dispose();
}

main();
