import React from 'react';
import ReactDOM from 'react-dom';
//具体单例类代码
export default class Singleton<P extends Object, S extends Object> {
    private dom: HTMLElement;
    private component: any;
    private ins: any;
    private props: P = {} as P;
    constructor(component, props?: P) {
        this.component = component;
        if (props) this.props = props;
    }
    render() {
        if (!this.dom) {
            this.dom = document.createElement('div');
            document.body.appendChild(this.dom);
        }
        var self = this;
        ReactDOM.render(<self.component {...this.props} ref={e => this.ins = e}></self.component>, this.dom);
    }
    destroy() {
        if (this.dom)
            ReactDOM.unmountComponentAtNode(this.dom);
    }
    setState(state: S) {
        if (this.ins) {
            this.ins.setState(state);
        }
    }
}