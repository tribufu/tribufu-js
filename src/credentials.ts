// Copyright (c) Tribufu. All Rights Reserved.
// SPDX-License-Identifier: MIT

export enum CredentialsType {
    ApiKey,
    Bearer,
}

export interface Credentials {
    type: CredentialsType;
    value: string;
}
