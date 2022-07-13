import { BronziteClient } from '../src/client'
import { Client, ClientEvents } from 'discord.js'
import { ZodError } from 'zod'
import { bronzitePlugin } from '../src/plugin'
import { once } from 'events'
import { describe, beforeEach, it, expect, jest } from '@jest/globals'
import { CamelToPascal, _clientEventsArray } from '../src/utils'
import { pascalCase } from 'pascal-case'

Client.prototype.login = async function (token) {
    setTimeout(() => this.emit('ready', {} as Client), 1_000)
    this.token = token ?? null
    return 'noop'
}

describe('client', () => {
    let client: BronziteClient

    beforeEach(() => {
        client = new BronziteClient({
            intents: []
        })
    })

    it("should be an instance of discordjs' client", () => {
        expect(client).toBeInstanceOf(Client)
    })

    it('should fail with invalid metadata', () => {
        // @ts-expect-error we're testing
        expect(() => client.register({})).rejects.toThrowError(ZodError)
    })

    it('should succeed with valid metadata', () => {
        expect(client.register(bronzitePlugin(async () => { }, { name: 'test' }))).resolves.toBeInstanceOf(BronziteClient)
        expect(client['_plugins'].immediate[0].name).toBe('test')
    })

    it('should decorate', async () => {
        const plugin = bronzitePlugin(async (client) => {
            client.decorate('testProp', 'testVal')
        }, { name: 'test', startAt: 'immediate' })
        await client.register(plugin)
        expect((client as any).testProp).toBe('testVal')
    })

    it('should fail to add a hook without a valid callback', () => {
        // @ts-expect-error we're testing
        expect(() => client.addHook('onReady', null)).toThrowError(ZodError)
    })

    it('should run the hooks by priority', async () => {
        const preLoginFunc = jest.fn()
        const postLoginFunc = jest.fn()
        const readyFunc = jest.fn()
        client.addHook('onPreLogin', preLoginFunc)
        client.addHook('onPostLogin', postLoginFunc)
        client.addHook('onPostReady', readyFunc)
        await client.login('token')
        expect(preLoginFunc).toHaveBeenCalled()
        expect(postLoginFunc).toHaveBeenCalled()
        expect(readyFunc).not.toHaveBeenCalled()
        await once(client, 'ready')
        expect(preLoginFunc).toHaveBeenCalled()
        expect(postLoginFunc).toHaveBeenCalled()
        expect(readyFunc).toHaveBeenCalled()
    })

    _clientEventsArray.filter(v => v !== "error").forEach(event => {
        it(`should run the hook with ${event}`, async () => {
            const cEvent = pascalCase(event) as CamelToPascal<keyof ClientEvents>
            const func = jest.fn()
            client.addHook(`onPost${cEvent}`, func)
            expect(func).not.toHaveBeenCalled()
            await client.emit(event)
            expect(func).toHaveBeenCalled()
        })
    })

    it('should work with custom events', () => {
        const func = jest.fn()
        client.on('customEvent', () => void func())
        client.emit('customEvent')
        expect(func).toHaveBeenCalled()
    })

    it('should run plugins depended on by other plugins first', async () => {
        const plugin1 = bronzitePlugin(async (client) => {
            client.decorate('testProp', 'testVal')
        }, { name: 'test-1', startAt: 'preLogin' })
        const plugin2 = bronzitePlugin(async (client) => {
            expect((client as any).testProp).toBe('testVal')
        }, { name: 'test-2', dependencies: ['test-1'], startAt: 'preLogin' })
        await client.register(plugin2)
        await client.register(plugin1)
        await client.login('token')
    })

    it('should work both ways', async () => {
        const plugin1 = bronzitePlugin(async (client) => {
            expect((client as any).testProp).toBe('testVal')
        }, { name: 'test-1', dependencies: ['test-2'], startAt: 'preLogin' })
        const plugin2 = bronzitePlugin(async (client) => {
            client.decorate('testProp', 'testVal')
        }, { name: 'test-2', startAt: 'preLogin' })
        await client.register(plugin2)
        await client.register(plugin1)
        await client.login('token')
    })

    it('should error on a circular dependency', async () => {
        const plugin1 = bronzitePlugin(async (client) => {
            client.decorate('testProp', 'testVal')
        }, { name: 'test-1', dependencies: ['test-2'], startAt: 'preLogin' })
        const plugin2 = bronzitePlugin(async (client) => {
            expect((client as any).testProp).toBe('testVal')
        }, { name: 'test-2', dependencies: ['test-1'], startAt: 'preLogin' })
        await client.register(plugin2)
        await client.register(plugin1)
        expect(() => client.login('token')).rejects.toThrowError(new Error(`Circular dependency detected: test-1 depends on test-2`))
    })

    it('should ignore both plugins on a circular dependency', async () => {
        client['_pluginCircularBehavior'] = 'ignore'
        const plugin1 = bronzitePlugin(async () => { }, { name: 'test-1', dependencies: ['test-2'], startAt: 'preLogin' })
        const plugin2 = bronzitePlugin(async () => { }, { name: 'test-2', dependencies: ['test-1'], startAt: 'preLogin' })
        await client.register(plugin2)
        await client.register(plugin1)
        await client.login('token')
        expect(client['_plugins'].preLogin.length).toBe(0)
    })

    it('should return 0', async () => {
        await client.register(bronzitePlugin(async (client) => {
            client.decorate('testProp', 'testVal')
        }, { name: 'test', startAt: 'preLogin' }))
        await client.register(bronzitePlugin(async (client) => {
            client.decorate('testProp2', 'testVal2')
        }, { name: 'test-2', startAt: 'preLogin' }))
        await client.login('token')
        expect((client as any).testProp).toBe('testVal')
        expect((client as any).testProp2).toBe('testVal2')
    })

    it('should default to process.env.DISCORD_TOKEN', async () => {
        process.env.DISCORD_TOKEN = 'token'
        await client.login()
        expect(client.token).toBe('token')
    })
})