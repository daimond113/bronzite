import type { BronziteClient } from "./client";
/**
 * Represents the metadata for a bronzite plugin.
 * @public
 */
interface BronzitePluginMetadata {
    name: string;
    dependencies?: string[];
    version?: string;
    startAt?: PluginPriority;
}
/**
 * Represents a bronzite plugin's loading priority.
 * @public
 */
export declare type PluginPriority = 'preLogin' | 'postLogin' | 'postReady';
/**
 * Represents a callable bronzite plugin.
 * @public
 */
export interface CallableBronzitePluginMetadata extends BronzitePluginMetadata {
    cb: BronzitePluginCallback;
}
/**
 * Represents a bronzite plugin callback.
 * @public
 */
declare type BronzitePluginCallback = ((client: BronziteClient, done: () => void) => void) | ((client: BronziteClient) => Promise<void>);
/**
 * Validates a bronzite plugin.
 * @param data - The metadata to validate.
 * @returns The validated metadata.
 * @public
 */
export declare function validateCallable(data: Partial<CallableBronzitePluginMetadata>): CallableBronzitePluginMetadata;
/**
 * Runs a bronzite plugin.
 * @param client - The client to use for the plugin.
 * @param plugin - The metadata for the plugin.
 * @returns The promise for the plugin.
 * @internal
 */
export declare function runPlugin(client: BronziteClient, plugin: CallableBronzitePluginMetadata): Promise<void>;
/**
 * Validates a bronzite plugin's metadata.
 * @param data - The metadata to validate.
 * @public
 */
export declare function bronzitePlugin<T extends BronzitePluginMetadata>(data: T): T;
/**
 * Creates a bronzite plugin.
 * @param cb - The callback to use for the plugin.
 * @param data - The metadata for the plugin.
 * @public
 */
export declare function bronzitePlugin(cb: BronzitePluginCallback, data: BronzitePluginMetadata): CallableBronzitePluginMetadata;
export default bronzitePlugin;
