// Copyright (c) Tribufu. All Rights Reserved.
// SPDX-License-Identifier: MIT

import { TribufuApi } from "./index";

/**
 * **Tribufu API**
 *
 * Creates the clients of the Tribufu API, each one with its own credentials.
 */
export class TribufuApiFactory {
    private constructor() {}

    /**
     * Client without credentials, for the endpoints that do not need authentication.
     */
    public static anonymous(): TribufuApi {
        return TribufuApi.default();
    }

    /**
     * Client with the credentials of the environment variables, or without credentials when they are not set.
     *
     * @param prefix A prefix for the environment variables. Default is `TRIBUFU`.
     */
    public static fromEnv(prefix: string = ""): TribufuApi {
        return TribufuApi.fromEnvOrDefault(prefix);
    }

    /**
     * Client acting for the owner of the API key.
     */
    public static forApiKey(apiKey: string): TribufuApi {
        return TribufuApi.withApiKey(apiKey);
    }

    /**
     * Client acting for a signed in user or client, with its access token.
     */
    public static forAccessToken(accessToken: string): TribufuApi {
        return TribufuApi.withBearerToken(accessToken);
    }

    /**
     * Client acting for a client, with its client credentials.
     *
     * - The client keeps its access token, so reuse it instead of creating one for each request.
     * - The client secret must never be exposed, so only use this on a server.
     */
    public static forClientCredentials(clientId: string, clientSecret: string): TribufuApi {
        return TribufuApi.withClientCredentials(clientId, clientSecret);
    }
}
