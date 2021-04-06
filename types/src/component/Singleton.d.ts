export default class Singleton<P extends Object, S extends Object> {
    private dom;
    private component;
    private ins;
    private props;
    constructor(component: any, props?: P);
    render(): void;
    destroy(): void;
    setState(state: S): void;
}
