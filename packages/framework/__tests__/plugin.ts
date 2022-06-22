import { bronzitePlugin } from '../src/plugin'

jest.mock('../package.json', () => ({ version: '1.0.0' }))

describe('bronzitePlugin', () => {
    it('should fail with non satisfying version', () => {
        expect(() => {
            bronzitePlugin(async () => { }, { name: 'test', version: '0.x' })
        }).toThrowError(new TypeError("Plugin test is not compatible with this Bronzite version! Expected: 0.x Got: 1.0.0"))
    })

    it('should fail with an invalid first argument', () => {
        expect(() => {
            // @ts-expect-error we're testing
            bronzitePlugin(null, { name: 'test' })
        }).toThrowError(new TypeError("BronzitePlugin's first argument must be a valid metadata object or a callback function"))
    })

    it('should fail with valid first argument and invalid second argument', () => {
        expect(() => {
            // @ts-expect-error we're testing
            bronzitePlugin(async () => { }, null)
        }).toThrowError(new TypeError("BronzitePlugin's second argument must be a valid metadata object"))
    })

    it('should fail with both invalid arguments', () => {
        expect(() => {
            // @ts-expect-error we're testing
            bronzitePlugin(null, null)
        }
        ).toThrowError(new TypeError("BronzitePlugin's first argument must be a valid metadata object or a callback function"))
    })

    it('should fail with first valid argument and truthy invalid second argument', () => {
        expect(() => {
            // @ts-expect-error we're testing
            bronzitePlugin(async () => { }, true)
        }).toThrowError(new TypeError("BronzitePlugin's second argument must be a valid metadata object"))
    })

    it('should validate with only 1 argument', () => {
        expect(bronzitePlugin({
            name: 'test',
        })).toStrictEqual({
            name: 'test',
        })
    })
})