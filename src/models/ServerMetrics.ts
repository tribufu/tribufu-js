/* tslint:disable */
/* eslint-disable */
/**
 * Tribufu API
 * REST API to access Tribufu services.
 *
 * The version of the OpenAPI document: 1.1.0
 * Contact: contact@tribufu.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface ServerMetrics
 */
export interface ServerMetrics {
    /**
     * 
     * @type {number}
     * @memberof ServerMetrics
     */
    serverCount?: number;
    /**
     * 
     * @type {number}
     * @memberof ServerMetrics
     */
    packageCount?: number;
    /**
     * 
     * @type {number}
     * @memberof ServerMetrics
     */
    countryCount?: number;
}

/**
 * Check if a given object implements the ServerMetrics interface.
 */
export function instanceOfServerMetrics(value: object): value is ServerMetrics {
    return true;
}

export function ServerMetricsFromJSON(json: any): ServerMetrics {
    return ServerMetricsFromJSONTyped(json, false);
}

export function ServerMetricsFromJSONTyped(json: any, ignoreDiscriminator: boolean): ServerMetrics {
    if (json == null) {
        return json;
    }
    return {
        
        'serverCount': json['server_count'] == null ? undefined : json['server_count'],
        'packageCount': json['package_count'] == null ? undefined : json['package_count'],
        'countryCount': json['country_count'] == null ? undefined : json['country_count'],
    };
}

export function ServerMetricsToJSON(json: any): ServerMetrics {
    return ServerMetricsToJSONTyped(json, false);
}

export function ServerMetricsToJSONTyped(value?: ServerMetrics | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'server_count': value['serverCount'],
        'package_count': value['packageCount'],
        'country_count': value['countryCount'],
    };
}

