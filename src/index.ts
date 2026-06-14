// Copyright (c) Tribufu. All Rights Reserved.
// SPDX-License-Identifier: MIT

import { Configuration } from "./runtime";
import { Credentials, CredentialsType } from "./credentials";
import { JavaScriptRuntime } from "./node";
import { TRIBUFU_API_URL, TRIBUFU_VERSION } from "./constants";
import { TribufuGeneratedApi } from "./apis/TribufuGeneratedApi";

export * from "./apis";
export * from "./constants";
export * from "./models";
export * from "./node";
export * from "./runtime";
export * from "./singletion";

/**
 * **Tribufu API**
 *
 * Use this class to interact with the Tribufu API.
 */
export class TribufuApi extends TribufuGeneratedApi {
    /**
     * Create a TribufuApi with the credentials.
     *
     * @param credentials The credentials for authentication.
     */
    constructor(credentials: Credentials | null = null) {
        super(TribufuApi.createConfiguration(credentials));
    }

    /**
     * Create a default TribufuApi instance.
     *
     * @return TribufuApi instance with default config.
     */
    public static default(): TribufuApi {
        return new TribufuApi();
    }

    /**
     * Create a TribufuApi with the given api key.
     *
     * - A api key give you public read only access to the Tribufu API.
     *
     * @param apiKey
     * @returns TribufuApi
     */
    public static withApiKey(apiKey: string): TribufuApi {
        return new TribufuApi({ type: CredentialsType.ApiKey, value: apiKey });
    }

    /**
     * Create a TribufuApi with the given access token.
     *
     * - A access token give you user read and write access to the Tribufu API.
     *
     * @param accessToken
     * @returns TribufuApi
     */
    public static withAccessToken(accessToken: string): TribufuApi {
        return new TribufuApi({ type: CredentialsType.Bearer, value: accessToken });
    }

    /**
     * Try to create a TribufuApi from environment variables.
     *
     * - This will only work if the environment variables are set.
     *
     * @param prefix A prefix for the environment variables. Default is `TRIBUFU`.
     * @returns TribufuApi | null
     * @example
     * ```ts
     * // process.env.TRIBUFU_API_KEY
     * const api = TribufuApi.fromEnv();
     * ```
     */
    public static fromEnv(prefix?: string | null): TribufuApi | null {
        if (typeof process === "undefined") {
            return null;
        }

        const apiKey = process.env[`${prefix || "TRIBUFU"}_API_KEY`];

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
     * @returns TribufuApi | null
     * @example
     * ```ts
     * // process.env.TRIBUFU_API_KEY = null
     * const api = TribufuApi.fromEnvOrDefault();
     * ```
     */
    public static fromEnvOrDefault(prefix: string = ""): TribufuApi {
        return TribufuApi.fromEnv(prefix) || TribufuApi.default();
    }

    /**
     * Creates a configuration for the Tribufu API client.
     */
    private static createConfiguration(credentials: Credentials | null): Configuration {
        const basePath = this.getBaseUrl();
        const headers: Record<string, string> = {
            "User-Agent": this.getUserAgent(),
        };

        if (credentials) {
            switch (credentials.type) {
                case CredentialsType.ApiKey:
                    headers["Authorization"] = `ApiKey ${credentials.value}`;
                    break;
                case CredentialsType.Bearer:
                    headers["Authorization"] = `Bearer ${credentials.value}`;
                    break;
            }
        }

        return new Configuration({
            basePath,
            headers,
        });
    }

    /**
     * Get the base url for the Tribufu API.
     *
     * - The base url can be set using the environment variable `TRIBUFU_API_URL`.
     * - The custom base url is only used if debug mode is enabled.
     * - The default base url is `https://api.tribufu.com`.
     *
     * @returns string
     */
    protected static getBaseUrl(): string {
        if (typeof process === "undefined") {
            return TRIBUFU_API_URL;
        }

        const baseUrl = process.env[`TRIBUFU_API_URL`] || null;
        return this.debugEnabled() && baseUrl ? baseUrl : TRIBUFU_API_URL;
    }

    /**
     * Get the version of the Tribufu client.
     */
    public static getVersion(): string {
        try {
            return TRIBUFU_VERSION;
        } catch {
            return "dev";
        }
    }

    /**
     * Get the User-Agent string for the API.
     */
    private static getUserAgent(): string {
        const version = this.getVersion();
        const os = process.platform;
        const arch = process.arch;
        const nodeVersion = process.version;
        return `Tribufu/${version} (Node.js ${nodeVersion}; ${os}; ${arch})`;
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
        if (typeof process !== "undefined") {
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
