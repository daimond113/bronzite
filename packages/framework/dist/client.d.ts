import { Client, ClientOptions } from "discord.js";
/**
 * Represents the priority a hook should run on.
 * @public
 */
export declare type HookPriority = "onLogin" | "onReady";
/**
 * Represents the options for creating a BronziteClient.
 * @public
 */
export interface BronziteOptions extends ClientOptions {
    pluginCircularDependencyBehavior?: "error" | "ignore";
}
/**
 * Represents a hook's callback function.
 * @public
 */
export declare type HookCallback = (client: BronziteClient) => void;
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
