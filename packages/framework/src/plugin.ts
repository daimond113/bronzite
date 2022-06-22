import type { BronziteClient } from "./client";
import z, { ZodRawShape } from 'zod'
import semver from 'semver'

// TODO: figure out how to require it from the package.json
// without making ts output a whole different dist structure
const version = '0.0.0'

/**
 * Represents the metadata for a bronzite plugin.
 * @public
 */
interface BronzitePluginMetadata {
    name: string;
    dependencies?: string[],
    version?: string;
    startAt?: PluginPriority;
}

/**
 * Represents a bronzite plugin's loading priority.
 * @public
 */
export type PluginPriority = 'immediate' | 'preLogin' | 'postLogin' | 'postReady';

/**
 * Represents a callable bronzite plugin.
 * @public
 */
export interface BronziteCallablePluginMetadata extends BronzitePluginMetadata {
    cb: BronzitePluginCallback;
}

/**
 * Represents a bronzite plugin callback.
 * @public
 */
type BronzitePluginCallback = (client: BronziteClient) => Promise<any>;

/**
 * Validates a bronzite plugin.
 * @param data - The metadata to validate.
 * @param callable - If the metadata's is callable.
 * @returns The validated metadata.
 * @public
 */
export function validate(data: Partial<BronzitePluginMetadata>, callable: false): BronzitePluginMetadata
/**
 * Validates a bronzite plugin.
 * @param data - The metadata to validate.
 * @param callable - If the metadata's is callable.
 * @returns The validated metadata.
 * @public
 */
export function validate(data: Partial<BronziteCallablePluginMetadata>, callable: true): BronziteCallablePluginMetadata
/**
 * Validates a bronzite plugin.
 * @param data - The metadata to validate.
 * @param callable - If the metadata's is callable.
 * @returns The validated metadata.
 * @public
 */
export function validate<T>(data: Partial<T>, callable: boolean): T
/**
 * Validates a bronzite plugin.
 * @param data - The metadata to validate.
 * @param callable - If the metadata's is callable.
 * @returns The validated metadata.
 * @public
 */
export function validate(data: Partial<BronzitePluginMetadata | BronziteCallablePluginMetadata>, callable: boolean): BronzitePluginMetadata | BronziteCallablePluginMetadata {
    const obj = {
        name: z.string(),
        dependencies: z.array(z.string()).optional(),
        version: z.string().optional(),
        startAt: z.enum(['immediate', 'preLogin', 'postLogin', 'postReady']).optional()
    } as ZodRawShape
    if (callable) obj.cb = z.function()
    const _r = z.object(obj).parse(data) as any
    if (data.version) {
        if (!semver.satisfies(version, data.version)) throw new Error(`Plugin ${data.name} is not compatible with this Bronzite version! Expected: ${data.version} Got: ${version}`)
    }
    return _r
}

/**
 * Runs a bronzite plugin.
 * @param client - The client to use for the plugin.
 * @param plugin - The metadata for the plugin.
 * @returns The promise resolving after the plugin has ran
 * @internal
 */
export function runPlugin(client: BronziteClient, plugin: BronziteCallablePluginMetadata): Promise<unknown> {
    return Promise.resolve(plugin.cb(client))
}

function generate(cb: BronzitePluginCallback, metadata: BronzitePluginMetadata): BronziteCallablePluginMetadata {
    return validate({
        name: metadata.name,
        dependencies: metadata.dependencies,
        version: metadata.version,
        startAt: metadata.startAt,
        cb
    }, true);
}

/**
 * Validates a bronzite plugin's metadata.
 * @param data - The metadata to validate.
 * @public
 */
export function bronzitePlugin<T extends BronzitePluginMetadata>(data: T): T
/**
 * Creates a bronzite plugin.
 * @param cb - The callback to use for the plugin.
 * @param data - The metadata for the plugin.
 * @public
 */
export function bronzitePlugin(cb: BronzitePluginCallback, data: BronzitePluginMetadata): BronziteCallablePluginMetadata
/**
 * Creates or validates a bronzite plugin.
 * @param dataOrCb - The data or callback to use for the plugin.
 * @param data - The metadata for the plugin.
 * @returns The metadata for the plugin.
 * @public
 */
export function bronzitePlugin(dataOrCb: BronzitePluginMetadata | BronzitePluginCallback, data?: BronzitePluginMetadata): BronzitePluginMetadata | BronziteCallablePluginMetadata {
    if (!z.function().safeParse(dataOrCb).success && !z.object({}).partial().safeParse(dataOrCb).success) throw new TypeError("BronzitePlugin's first argument must be a valid metadata object or a callback function");
    if (data && !z.object({}).partial().safeParse(data).success) throw new TypeError("BronzitePlugin's second argument must be a valid metadata object");
    if (typeof dataOrCb === 'function') {
        if (!data) throw new TypeError("BronzitePlugin's second argument must be a valid metadata object");
        return generate(dataOrCb, data);
    }
    return validate(dataOrCb, 'cb' in dataOrCb);
}

export default bronzitePlugin