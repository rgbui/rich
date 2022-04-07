import { Component } from "react";
import ReactDOM from 'react-dom';
import { Block } from "..";
export abstract class BlockView<T extends Block> extends Component<{ block: T }> {
    constructor(props) {
        super(props);
        this.block.view = this;
    }
    UNSAFE_componentWillMount(): void {
        this.block.isMounted = true;
    }
    componentDidUpdate(prevProps: Readonly<{ block: T; }>, prevState: Readonly<{}>, snapshot?: any): void {
        this.block.page.grid.sync(this.block);
    }
    componentDidMount() {
        this.block.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
        this.block.page.grid.sync(this.block);
        if (this.block.el) {
            (this.block.el as any).block = this.block;
        }
        this.didMount();
        try {
            this.block.onMounted()
        }
        catch (ex) {
            this.block.page.onError(ex);
        }
    }
    didMount() {

    }
    componentWillUnmount() {
        if (typeof this.willUnmount == 'function') {
            this.willUnmount();
        }
        this.block.isMounted = false;
        this.block.page.grid.remove(this.block);
    }
    willUnmount() {
        try {
            this.block.onUnmount()
        } catch (ex) {
            this.block.page.onError(ex);
        }
    }
    get block(): T {
        return this.props.block;
    }
}