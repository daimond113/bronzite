import { MarkdownDocumenterFeature, IMarkdownDocumenterFeatureOnBeforeWritePageArgs, IMarkdownDocumenterFeatureOnFinishedArgs } from '@microsoft/api-documenter';
export declare class DocusaurusMarkdownFeature extends MarkdownDocumenterFeature {
    private _apiItemsWithPages;
    onInitialized(): void;
    onBeforeWritePage(eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs): void;
    onFinished(eventArgs: IMarkdownDocumenterFeatureOnFinishedArgs): void;
    private _buildNavigation;
}
//# sourceMappingURL=DocusaurusMarkdownFeature.d.ts.map