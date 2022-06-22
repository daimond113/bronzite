"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocusaurusMarkdownFeature = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const api_documenter_1 = require("@microsoft/api-documenter");
class DocusaurusMarkdownFeature extends api_documenter_1.MarkdownDocumenterFeature {
    constructor() {
        super(...arguments);
        this._apiItemsWithPages = new Set();
    }
    onInitialized() {
        console.log('RushStackFeature: onInitialized()');
    }
    onBeforeWritePage(eventArgs) {
        // Add the Docusaurus frontmatter
        const header = [
            `---`,
            // Generated API docs have a built-in title header below the breadcrumbs
            `title: ${JSON.stringify(eventArgs.apiItem.displayName)}`,
            // `hide_title: true`,
            // Suppress the default Edit button and Next/Prev links for API docs
            `custom_edit_url: null`,
            `pagination_prev: null`,
            `pagination_next: null`,
            `---`,
            ''
        ].join('\n');
        eventArgs.pageContent = header + eventArgs.pageContent;
        // Requires more investigation. HTML comments are ok, but the little empty
        // comments (<!-- -->) that are inserted in between links break the MDX parser
        // in Docusuarus.
        eventArgs.pageContent = eventArgs.pageContent.replace(/<!-- -->/g, ' ');
        // @ts-ignore
        this._apiItemsWithPages.add(eventArgs.apiItem);
    }
    onFinished(eventArgs) {
        const navigationFile = {
            type: 'category',
            label: 'API Reference',
            items: [
                {
                    type: 'doc',
                    label: '(members)',
                    id: 'api/index'
                }
            ]
        };
        // @ts-ignore
        this._buildNavigation(navigationFile.items, this.context.apiModel);
        const navFilePath = path.join(this.context.outputFolder, '..', 'api_nav.json');
        const navFileContent = JSON.stringify(navigationFile, undefined, 2);
        node_core_library_1.FileSystem.writeFile(navFilePath, navFileContent, {
            ensureFolderExists: true
        });
    }
    _buildNavigation(parentNodes, parentApiItem) {
        for (const apiItem of parentApiItem.members) {
            if (this._apiItemsWithPages.has(apiItem)) {
                const label = apiItem.displayName;
                const id = path.posix
                    // @ts-ignore
                    .join('api/', this.context.documenter.getLinkForApiItem(apiItem))
                    .replace(/\.md$/, '')
                    .replace(/\/$/, '/index');
                const children = [];
                this._buildNavigation(children, apiItem);
                if (children.length > 0) {
                    const newNode = {
                        type: 'category',
                        label,
                        items: [
                            {
                                type: 'doc',
                                label: '(members)',
                                id
                            },
                            ...children
                        ]
                    };
                    parentNodes.push(newNode);
                }
                else {
                    const newNode = {
                        type: 'doc',
                        label,
                        id
                    };
                    parentNodes.push(newNode);
                }
            }
            else {
                this._buildNavigation(parentNodes, apiItem);
            }
        }
    }
}
exports.DocusaurusMarkdownFeature = DocusaurusMarkdownFeature;
//# sourceMappingURL=DocusaurusMarkdownFeature.js.map