import { Client } from 'discord.js';
import { ClientOptions } from 'discord.js';

/**
 * Represents the main client for the framework.
 * @public
 */
export declare class BronziteClient extends Client {
    private _pluginCircularBeh;
    constructor(options: BronziteOptions);
    private _plugins;
    private _hooks;
    /**
     * Adds a property to the client.
     * @param prop - The property to set.
     * @param value - The value to set the property to.
     */
    decorate(prop: string, value: any): void;
    /**
     * Adds a hook to the client.
     * @param hook - The {@link HookPriority | hook priority} this hook should run on.
     * @param cb - The callback to run.
     */
    addHook(hook: HookPriority, cb: HookCallback): void;
    /**
     * Runs plugins and resolves dependencies.
     * @param plugins - The plugins to run.
     * @returns A promise that resolves when all plugins are ran.
     * @internal
     */
    private _runPluginsAndResolveDependencies;
    /**
     * Logs in to the Discord API and runs plugins.
     * @param token - The token to login with.
     * @returns A promise that resolves when the client is logged in and all plugins ran.
     */
    login(token?: string | undefined): Promise<string>;
}

/**
 * Represents the options for creating a BronziteClient.
 * @public
 */
export declare interface BronziteOptions extends ClientOptions {
    pluginCircularDependencyBehavior?: "error" | "ignore";
}

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

/**
 * Represents a bronzite plugin callback.
 * @public
 */
declare type BronzitePluginCallback = ((client: BronziteClient, done: () => void) => void) | ((client: BronziteClient) => Promise<void>);

/**
 * Represents the metadata for a bronzite plugin.
 * @public
 */
declare interface BronzitePluginMetadata {
    name: string;
    dependencies?: string[];
    version?: string;
    startAt?: PluginPriority;
}

/**
 * Represents a callable bronzite plugin.
 * @public
 */
export declare interface CallableBronzitePluginMetadata extends BronzitePluginMetadata {
    cb: BronzitePluginCallback;
}

/**
 * Represents a hook's callback function.
 * @public
 */
export declare type HookCallback = (client: BronziteClient) => void;

/**
 * Represents the priority a hook should run on.
 * @public
 */
export declare type HookPriority = "onLogin" | "onReady";

/**
 * Represents a bronzite plugin's loading priority.
 * @public
 */
export declare type PluginPriority = 'preLogin' | 'postLogin' | 'postReady';

/**
 * Runs a bronzite plugin.
 * @param client - The client to use for the plugin.
 * @param plugin - The metadata for the plugin.
 * @returns The promise for the plugin.
 * @internal
 */
export declare function runPlugin(client: BronziteClient, plugin: CallableBronzitePluginMetadata): Promise<void>;

/**
 * Validates a bronzite plugin.
 * @param data - The metadata to validate.
 * @returns The validated metadata.
 * @public
 */
export declare function validateCallable(data: Partial<CallableBronzitePluginMetadata>): CallableBronzitePluginMetadata;

export { }
