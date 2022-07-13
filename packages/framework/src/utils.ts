import type { ClientEvents } from "discord.js"
import { keys } from 'ts-transformer-keys'

/**
 * Represents discord.js' ClientEvents as an array of it's keys in pascal case.
 * @internal
 */
export const _clientEventsArray = keys<ClientEvents>()

/**
 * Converts camel case strings to pascal case.
 * @public
 */
export type CamelToPascal<T extends string> =
    T extends `${infer FirstChar}${infer Rest}` ? `${Capitalize<FirstChar>}${Rest}` : never