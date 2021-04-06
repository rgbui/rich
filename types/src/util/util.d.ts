export declare var util: {
    inherit(Mix: any, ...mixins: any[]): any;
    guid(): string;
    clone<T>(json: T): T;
    valueIsEqual(a: any, b: any): boolean;
    getStyle(node: HTMLElement, attr: string): any;
    domClosest(el: HTMLElement, predict: (pa: HTMLElement) => boolean): HTMLElement;
};
