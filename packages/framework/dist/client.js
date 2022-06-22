var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Client } from "discord.js";
import { runPlugin } from "./plugin";
/**
 * Represents the main client for the framework.
 * @public
 */
var BronziteClient = /** @class */ (function (_super) {
    __extends(BronziteClient, _super);
    function BronziteClient(options) {
        var _this = _super.call(this, options) || this;
        _this._plugins = {
            preLogin: [],
            postLogin: [],
            postReady: []
        };
        _this._hooks = {
            onLogin: [],
            onReady: []
        };
        _this._pluginCircularBeh = options.pluginCircularDependencyBehavior || "error";
        return _this;
    }
    /**
     * Adds a property to the client.
     * @param prop - The property to set.
     * @param value - The value to set the property to.
     */
    BronziteClient.prototype.decorate = function (prop, value) {
        // @ts-ignore
        this[prop] = value;
    };
    /**
     * Adds a hook to the client.
     * @param hook - The {@link HookPriority | hook priority} this hook should run on.
     * @param cb - The callback to run.
     */
    BronziteClient.prototype.addHook = function (hook, cb) {
        if (typeof cb !== "function")
            throw new Error("Callback must be a function");
        this._hooks[hook].push(cb);
    };
    /**
     * Runs plugins and resolves dependencies.
     * @param plugins - The plugins to run.
     * @returns A promise that resolves when all plugins are ran.
     * @internal
     */
    BronziteClient.prototype._runPluginsAndResolveDependencies = function (plugins) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var sortedPlugins = plugins.sort(function (a, b) {
                if (a.dependencies && b.dependencies) {
                    var aDependsOnB = a.dependencies.includes(b.name);
                    var bDependsOnA = b.dependencies.includes(a.name);
                    if (aDependsOnB && bDependsOnA) {
                        if (_this._pluginCircularBeh === "error") {
                            throw new Error("Circular dependency detected: ".concat(a.name, " depends on ").concat(b.name));
                        }
                        else {
                            // @ts-ignore
                            a.delete = true;
                            // @ts-ignore
                            b.delete = true;
                        }
                    }
                    if (aDependsOnB)
                        return 1;
                    if (bDependsOnA)
                        return -1;
                }
                return 0;
                // @ts-ignore
            }).filter(function (v) { return !v.delete; });
            var promises = sortedPlugins.map(function (plugin) { return runPlugin(_this, plugin); });
            Promise.all(promises).then(function () { return resolve(); }).catch(reject);
        });
    };
    /**
     * Logs in to the Discord API and runs plugins.
     * @param token - The token to login with.
     * @returns A promise that resolves when the client is logged in and all plugins ran.
     */
    BronziteClient.prototype.login = function (token) {
        if (token === void 0) { token = process.env.DISCORD_TOKEN; }
        return __awaiter(this, void 0, void 0, function () {
            var _r;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runPluginsAndResolveDependencies(this._plugins.preLogin)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.login.call(this, token)];
                    case 2:
                        _r = _a.sent();
                        return [4 /*yield*/, this._runPluginsAndResolveDependencies(this._plugins.postLogin)];
                    case 3:
                        _a.sent();
                        this._hooks.onLogin.forEach(function (cb) { return cb(_this); });
                        return [2 /*return*/, _r];
                }
            });
        });
    };
    return BronziteClient;
}(Client));
export { BronziteClient };
