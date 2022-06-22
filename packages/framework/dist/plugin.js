import z from 'zod';
function validate(data) {
    return z.object({
        name: z.string(),
        dependencies: z.array(z.string()).optional(),
        version: z.string().optional(),
        startAt: z.enum(['preLogin', 'postLogin', 'postReady']).optional()
    }).parse(data);
}
/**
 * Validates a bronzite plugin.
 * @param data - The metadata to validate.
 * @returns The validated metadata.
 * @public
 */
export function validateCallable(data) {
    return z.object({
        name: z.string(),
        dependencies: z.array(z.string()).optional(),
        version: z.string().optional(),
        startAt: z.enum(['preLogin', 'postLogin', 'postReady']).optional(),
        cb: z.function()
    }).parse(data);
}
/**
 * Runs a bronzite plugin.
 * @param client - The client to use for the plugin.
 * @param plugin - The metadata for the plugin.
 * @returns The promise for the plugin.
 * @internal
 */
export function runPlugin(client, plugin) {
    return new Promise(function (resolve, reject) {
        var returnType = plugin.cb(client, function () { return resolve(); });
        if (returnType && returnType.then)
            returnType.then(function () { return resolve(); }).catch(reject);
    });
}
function generate(cb, metadata) {
    return validateCallable({
        name: metadata.name,
        dependencies: metadata.dependencies,
        version: metadata.version,
        startAt: metadata.startAt,
        cb: cb
    });
}
/**
 * Creates or validates a bronzite plugin.
 * @param dataOrCb - The data or callback to use for the plugin.
 * @param data - The metadata for the plugin.
 * @returns The metadata for the plugin.
 * @public
 */
export function bronzitePlugin(dataOrCb, data) {
    if (z.function().safeParse(dataOrCb) || z.object({}).partial().safeParse(dataOrCb))
        throw new Error("BronzitePlugin's first argument must be a valid metadata object or a callback function");
    if (data && !z.object({}).partial().safeParse(data))
        throw new Error("BronzitePlugin's second argument must be a valid metadata object");
    if (typeof dataOrCb === 'function') {
        if (!data)
            throw new Error("BronzitePlugin's second argument must be a valid metadata object");
        return generate(dataOrCb, data);
    }
    return validate(dataOrCb);
}
export default bronzitePlugin;
