"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiDocumenterPluginManifest = void 0;
const DocusaurusMarkdownFeature_1 = require("./DocusaurusMarkdownFeature");
exports.apiDocumenterPluginManifest = {
    manifestVersion: 1000,
    features: [
        {
            featureName: 'docusaurus-markdown-documenter',
            kind: 'MarkdownDocumenterFeature',
            subclass: DocusaurusMarkdownFeature_1.DocusaurusMarkdownFeature
        }
    ]
};
//# sourceMappingURL=index.js.map