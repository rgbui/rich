/// <reference types="react" />
import { BaseComponent } from "../base/component";
import { Content } from "../base/common/content";
import "../../../node_modules/katex/dist/katex.min.css";
export declare class Katex extends Content {
    formula: string;
    get htmlContent(): {
        __html: any;
    };
}
export declare class KatexView extends BaseComponent<Katex> {
    render(): JSX.Element;
}
