import { Component } from "react";
import { PageLayout } from "./index";
export declare class PageLayoutView extends Component<{
    pageLayout: PageLayout;
}> {
    constructor(props: any);
    get pageLayout(): PageLayout;
    render(): JSX.Element;
}
