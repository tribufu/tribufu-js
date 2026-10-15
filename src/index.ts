// Copyright (c) Tribufu. All Rights Reserved.
// SPDX-License-Identifier: MIT

import { Configuration, type Middleware, type RequestContext } from "./runtime";
import { JavaScriptRuntime } from "./node";
import { TRIBUFU_API_URL, TRIBUFU_AUTH_URL, TRIBUFU_VERSION } from "./constants";
import { TribufuGeneratedApi } from "./apis/TribufuGeneratedApi";

export * from "./apis";
export * from "./constants";
export * from "./models";
export * from "./node";
export * from "./runtime";
export * from "./factory";

export enum CredentialsType {
    ApiKey = "api_key",
    BearerToken = "bearer_token",
    ClientCredentials = "client_credentials",
}

export type Credentials =
    | { type: CredentialsType.ApiKey; apiKey: string }
    | { type: CredentialsType.BearerToken; token: string }
    | { type: CredentialsType.ClientCredentials; clientId: string; clientSecret: string };

const TOKEN_REQUEST_TIMEOUT = 10_000;
const MAX_TOKEN_REFRESH_MARGIN = 30_000;

/**
 * **Tribufu API**
 *
 * Use this class to interact with the Tribufu API.
 */
export class TribufuApi extends TribufuGeneratedApi {
    readonly #credentials: Credentials | null;
    #accessToken: string | null = null;
    #refreshAt = 0;
    #pendingToken: Promise<string> | null = null;
    #refreshTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Create a TribufuApi with the given credentials.
     *
     * @param credentials The credentials for authentication, or `null` for anonymous access.
     */
    constructor(credentials: Credentials | null = null) {
        const middleware: Middleware[] = [];
        super(TribufuApi.createConfiguration(credentials, middleware));
        this.#credentials = credentials;

        if (credentials?.type === CredentialsType.ClientCredentials) {
            if (!credentials.clientId || !credentials.clientSecret) {
                throw new Error("Client credentials are required");
            }

            middleware.push({
                pre: (context) => this.#authorize(context),
                post: async ({ response }) => {
                    if (response.status === 401) {
                        this.#clearAccessToken();
                    }

                    return response;
                },
            });
        }
    }

    /**
     * Create a default TribufuApi instance, without credentials.
     *
     * @return TribufuApi instance with default config.
     */
    public static default(): TribufuApi {
        return new TribufuApi();
    }

    /**
     * Create a TribufuApi with the given API key.
     *
     * @param apiKey
     * @returns TribufuApi
     */
    public static withApiKey(apiKey: string): TribufuApi {
        return new TribufuApi({ type: CredentialsType.ApiKey, apiKey });
    }

    /**
     * Create a TribufuApi with the given access token of a user or client.
     *
     * @param token
     * @returns TribufuApi
     */
    public static withBearerToken(token: string): TribufuApi {
        return new TribufuApi({ type: CredentialsType.BearerToken, token });
    }

    /**
     * Create a TribufuApi with the given client credentials.
     *
     * - The access token of the client is requested and refreshed automatically.
     * - The client secret must never be exposed, so only use this on a server.
     *
     * @param clientId
     * @param clientSecret
     * @returns TribufuApi
     */
    public static withClientCredentials(clientId: string, clientSecret: string): TribufuApi {
        return new TribufuApi({ type: CredentialsType.ClientCredentials, clientId, clientSecret });
    }

    /**
     * Clear the access token of the client and stop refreshing it.
     */
    public dispose(): void {
        this.#clearAccessToken();
    }

    /**
     * Try to create a TribufuApi from environment variables.
     *
     * - This will only work if the environment variables are set.
     * - The client credentials take precedence over the API key.
     *
     * @param prefix A prefix for the environment variables. Default is `TRIBUFU`.
     * @returns TribufuApi | null
     * @example
     * ```ts
     * // process.env.TRIBUFU_CLIENT_ID and process.env.TRIBUFU_CLIENT_SECRET
     * // or process.env.TRIBUFU_API_KEY
     * const api = TribufuApi.fromEnv();
     * ```
     */
    public static fromEnv(prefix?: string | null): TribufuApi | null {
        if (typeof process === "undefined" || !process.env) {
            return null;
        }

        const envPrefix = prefix || "TRIBUFU";
        const clientId = process.env[`${envPrefix}_CLIENT_ID`];
        const clientSecret = process.env[`${envPrefix}_CLIENT_SECRET`];

        if (clientId !== undefined || clientSecret !== undefined) {
            return TribufuApi.withClientCredentials(clientId ?? "", clientSecret ?? "");
        }

        const apiKey = process.env[`${envPrefix}_API_KEY`];

        if (apiKey) {
            return TribufuApi.withApiKey(apiKey);
        }

        return null;
    }

    /**
     * Create a TribufuApi from environment variables or the default api.
     *
     * - This will fallback to the default api if the environment variables are not set.
     *
     * @param prefix A prefix for the environment variables. Default is `TRIBUFU`.
     * @returns TribufuApi
     */
    public static fromEnvOrDefault(prefix: string = ""): TribufuApi {
        return TribufuApi.fromEnv(prefix) || TribufuApi.default();
    }

    private static createConfiguration(credentials: Credentials | null, middleware: Middleware[]): Configuration {
        const headers: Record<string, string> = {};
        const userAgent = this.getUserAgent();

        if (userAgent) {
            headers["User-Agent"] = userAgent;
        }

        if (credentials?.type === CredentialsType.ApiKey && credentials.apiKey) {
            headers["Authorization"] = `Bearer ${credentials.apiKey}`;
        } else if (credentials?.type === CredentialsType.BearerToken && credentials.token) {
            headers["Authorization"] = `Bearer ${credentials.token}`;
        }

        return new Configuration({
            basePath: this.getBaseUrl(),
            headers,
            middleware,
        });
    }

    async #authorize({ url, init }: RequestContext): Promise<{ url: string; init: RequestInit }> {
        const headers = new Headers(init.headers);
        headers.set("Authorization", `Bearer ${await this.#getAccessToken()}`);
        return { url, init: { ...init, headers } };
    }

    #getAccessToken(): Promise<string> {
        if (this.#accessToken && Date.now() < this.#refreshAt) {
            return Promise.resolve(this.#accessToken);
        }

        this.#pendingToken ??= this.#requestAccessToken().finally(() => {
            this.#pendingToken = null;
        });

        return this.#pendingToken;
    }

    async #requestAccessToken(): Promise<string> {
        if (this.#credentials?.type !== CredentialsType.ClientCredentials) {
            throw new Error("Client credentials are required");
        }

        const clientId = new URLSearchParams([["", this.#credentials.clientId]]).toString().slice(1);
        const clientSecret = new URLSearchParams([["", this.#credentials.clientSecret]]).toString().slice(1);
        const requestedAt = Date.now();
        const response = await fetch(`${TribufuApi.getAuthUrl()}/realms/tribufu/protocol/openid-connect/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({ grant_type: "client_credentials" }),
            redirect: "error",
            credentials: "omit",
            cache: "no-store",
            signal: AbortSignal.timeout(TOKEN_REQUEST_TIMEOUT),
        });

        if (!response.ok) {
            throw new Error(`Client token request failed (${response.status})`);
        }

        const { access_token, token_type, expires_in } = await response.json();

        if (
            typeof access_token !== "string" ||
            !access_token ||
            typeof token_type !== "string" ||
            token_type.toLowerCase() !== "bearer" ||
            typeof expires_in !== "number" ||
            !Number.isFinite(expires_in) ||
            expires_in <= 0
        ) {
            throw new Error("Invalid client token response");
        }

        const lifetime = expires_in * 1000;
        this.#accessToken = access_token;
        this.#refreshAt = requestedAt + lifetime - Math.min(MAX_TOKEN_REFRESH_MARGIN, lifetime / 10);
        this.#scheduleRefresh();

        return access_token;
    }

    #scheduleRefresh(): void {
        this.#cancelRefresh();
        this.#refreshTimer = setTimeout(
            () => {
                this.#refreshTimer = null;
                this.#getAccessToken().catch((error) => console.error("[tribufu] client token refresh failed", error));
            },
            Math.max(0, this.#refreshAt - Date.now()),
        );
        this.#refreshTimer.unref?.();
    }

    #cancelRefresh(): void {
        if (this.#refreshTimer) {
            clearTimeout(this.#refreshTimer);
            this.#refreshTimer = null;
        }
    }

    #clearAccessToken(): void {
        this.#accessToken = null;
        this.#refreshAt = 0;
        this.#cancelRefresh();
    }

    /**
     * Get the base url for the Tribufu API.
     *
     * - The base url can be set using the environment variable `TRIBUFU_API_URL`.
     * - The default base url is `https://api.tribufu.com`.
     *
     * @returns string
     */
    public static getBaseUrl(): string {
        if (typeof process === "undefined" || !process.env) {
            return TRIBUFU_API_URL;
        }

        return process.env.TRIBUFU_API_URL || TRIBUFU_API_URL;
    }

    /**
     * Get the base url for the Tribufu authentication.
     *
     * - The base url can be set using the environment variable `TRIBUFU_AUTH_URL`.
     * - The default base url is `https://auth.tribufu.com`.
     *
     * @returns string
     */
    public static getAuthUrl(): string {
        if (typeof process === "undefined" || !process.env) {
            return TRIBUFU_AUTH_URL;
        }

        return process.env.TRIBUFU_AUTH_URL || TRIBUFU_AUTH_URL;
    }

    /**
     * Get the version of the Tribufu client.
     */
    public static getVersion(): string {
        return TRIBUFU_VERSION;
    }

    /**
     * Get the User-Agent string for the API.
     *
     * - Browsers send their own User-Agent, so there is none to set in the browser.
     */
    private static getUserAgent(): string | null {
        if (this.isBrowser() || typeof process === "undefined" || !process.version) {
            return null;
        }

        return `Tribufu/${TRIBUFU_VERSION} (Node.js ${process.version}; ${process.platform}; ${process.arch})`;
    }

    /**
     * Check if debug mode is enabled.
     *
     * - Debug mode is enabled if the environment variable `NODE_ENV` is set to `development`.
     * - Debug mode is disabled by default.
     * - Debug mode is disabled in the browser.
     *
     * @returns boolean
     */
    public static debugEnabled(): boolean {
        if (typeof process !== "undefined" && process.env) {
            return process.env.NODE_ENV === "development";
        }

        return false;
    }

    /**
     * Detect the current JavaScript runtime.
     *
     * - This is used to determine if the code is running in a browser or in Node.js.
     *
     * @returns JavaScriptRuntime
     */
    public static detectRuntime(): JavaScriptRuntime {
        if (typeof window !== "undefined") {
            return JavaScriptRuntime.Browser;
        }

        if (typeof process !== "undefined" && process?.versions?.node) {
            return JavaScriptRuntime.Node;
        }

        return JavaScriptRuntime.Other;
    }

    /**
     * Check if the current JavaScript runtime is a browser.
     * @returns boolean
     */
    public static isBrowser(): boolean {
        return this.detectRuntime() === JavaScriptRuntime.Browser;
    }

    /**
     * Check if the current JavaScript runtime is Node.js.
     * @returns boolean
     */
    public static isNode(): boolean {
        return this.detectRuntime() === JavaScriptRuntime.Node;
    }
}
