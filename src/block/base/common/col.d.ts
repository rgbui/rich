/// <reference types="react" />
import { BaseComponent } from "../component";
import { Content } from "./content";
import { BlockAppear, BlockDisplay } from "../enum";
export declare class Col extends Content {
    display: BlockDisplay;
    appear: BlockAppear;
    get isCol(): boolean;
}
export declare class ColView extends BaseComponent<Col> {
    render(): JSX.Element;
}
