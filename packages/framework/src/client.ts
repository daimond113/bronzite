import { Client, type ClientEvents, type ClientOptions } from "discord.js";
import z from "zod";
import bronzitePlugin, { type BronziteCallablePluginMetadata, type PluginPriority, _runPlugin } from "./plugin";
import { CamelToPascal, _clientEventsArray } from "./utils";
import { pascalCase } from 'pascal-case'

/**
 * Makes {@link HookPriority | hook priority} key.
 * @public
 */
export type GenerateHookPriority<K extends string> = `onPre${K}` | `onPost${K}`;

/**
 * Represents the priority a hook should run on.
 * @public
 */
export type HookPriority = GenerateHookPriority<CamelToPascal<keyof ClientEvents>> | GenerateHookPriority<'Login'>;

/**
 * Represents the options for creating a BronziteClient.
 * @public
 */
export interface BronziteOptions extends ClientOptions {
    /**
     * How to handle circular dependencies in plugins.
     * @defaultValue "error"
     */
    pluginCircularDependencyBehavior?: "error" | "ignore"
}

/**
 * Represents a hook's callback function.
 * @public
 */
export type HookCallback = (client: BronziteClient) => void

/**
 * Represents the main client for the framework.
 * @public
 */
export class BronziteClient extends Client {
    private _pluginCircularBehavior

    constructor(options: BronziteOptions) {
        super(options)
        this._pluginCircularBehavior = options.pluginCircularDependencyBehavior || "error";
    }

    private _plugins: { [key in PluginPriority]: BronziteCallablePluginMetadata[] } = {
        immediate: [],
        preLogin: [],
        postLogin: [],
        postReady: []
    }

    private _hooks: { [key in HookPriority]: HookCallback[] } = this._makeHooks()

    private _makeHooks() {
        return [..._clientEventsArray, 'login'].reduce<Record<HookPriority, HookCallback[]>>((acc, event) => {
            const e = pascalCase(event)
            return {
                ...acc,
                [`onPre${e}`]: [],
                [`on${e}`]: [],
                [`onPost${e}`]: []
            }
        }, {} as any)
    }

    private _runHooks(hook: unknown, type: 'Pre' | 'Post') {
        if (!_clientEventsArray.includes(String(hook) as any)) return
        const e = pascalCase(String(hook)) as CamelToPascal<keyof ClientEvents>;
        this._hooks[`on${type}${e}`].forEach((cb) => cb(this))
    }

    /**
     * Emits events and runs hooks.
     * @param event - The event to listen to.
     * @param args - The arguments to pass to the event.
     * @returns If the event had listeners.
     */
    public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    /**
     * Emits events and runs hooks.
     * @param event - The event to listen to.
     * @param args - The arguments to pass to the event.
     * @returns If the event had listeners.
     */
    public emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: unknown[]): boolean;
    public emit(event: string | symbol, ...args: any[]): boolean {
        this._runHooks(event, 'Pre')
       const hadListeners = super.emit(event, ...args)
        this._runHooks(event, 'Post')
        return hadListeners
    }

    /**
     * Adds a plugin to the client.
     * @param plugin - The plugin to add.
     * @returns The client.
     */
    async register(plugin: BronziteCallablePluginMetadata): Promise<this> {
        plugin = bronzitePlugin(plugin);
        const priority = plugin.startAt || "immediate";
        this._plugins[priority].push(plugin);
        if (priority === "immediate") {
            await _runPlugin(this, plugin);
        }
        return this
    }

    /**
     * Adds a property to the client.
     * @param key - The property to set.
     * @param value - The value to set the property to.
     * @returns The client.
     */
    decorate<K extends PropertyKey, V>(key: K, value: V): this {
        Object.defineProperty(this, key, {
            value,
            writable: true,
            enumerable: true,
            configurable: true
        });
        return this
    }

    /**
     * Adds a hook to the client.
     * @param hook - The {@link HookPriority | hook priority} this hook should run on.
     * @param cb - The callback to run.
     * @returns The client.
     */
    addHook(hook: HookPriority, cb: HookCallback): this {
        z.function().parse(cb)
        this._hooks[hook].push(cb);
        return this;
    }

    /**
     * Runs plugins and resolves dependencies.
     * @param plugins - The plugins to run.
     * @returns A promise that resolves when all plugins are ran.
     * @internal
     */
    private async _runPluginsAndResolveDependencies(plugins: (BronziteCallablePluginMetadata & { delete?: true })[]) {
        const sortedPlugins = plugins.sort((a, b) => {
            const aDependsOnB = a.dependencies?.includes(b.name);
            const bDependsOnA = b.dependencies?.includes(a.name);
            if (aDependsOnB && bDependsOnA) {
                if (this._pluginCircularBehavior === "error") {
                    throw new Error(`Circular dependency detected: ${a.name} depends on ${b.name}`);
                } else {
                    a.delete = true;
                    b.delete = true;
                    return 0;
                }
            }
            if (aDependsOnB) return 1;
            if (bDependsOnA) return -1;
            return 0;
        });
        if (sortedPlugins[0]) {
            const { startAt } = sortedPlugins[0]
            this._plugins[startAt!] = sortedPlugins.filter(p => !p.delete);
        };
        const promises = sortedPlugins.map(plugin => _runPlugin(this, plugin));
        await Promise.all(promises)
    }

    /**
     * Logs in to the Discord API and runs plugins.
     * @param token - The token to login with.
     * @returns A promise that resolves when the client is logged in and all plugins ran.
     */
    async login(token = process.env.DISCORD_TOKEN) {
        await this._runPluginsAndResolveDependencies(this._plugins.preLogin)
        this.once('ready', () => {
            this._runPluginsAndResolveDependencies(this._plugins.postReady)
            this._hooks.onPostReady.forEach(cb => cb(this))
        })
        this._hooks.onPreLogin.forEach(cb => cb(this))
        const _r = await super.login(token);
        this._hooks.onPostLogin.forEach(cb => cb(this));
        await this._runPluginsAndResolveDependencies(this._plugins.postLogin)
        return _r;
    }
}