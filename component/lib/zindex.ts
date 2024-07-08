
export enum LayerType {
    /**
     * 消息提示，
     * z-index通常为最高的，
     * 用户查看消息提示
     */
    tip,
    /**
     * 页面弹窗，相比popover更低一些
     */
    page,
    /**
     * 弹窗对话框（用来交互处理的）
     */
    popover,
    /**
     * 起伏层（比普通视觉元素高一些些）
     */
    rise
}



class Layer {
    constructor(type: LayerType) {
        this.type = type;
        this.init()
    }
    private init() {
        switch (this.type) {
            case LayerType.popover:
                this.min = 20000;
                this.max = 50000;
                this.index = this.min;
                break;
            case LayerType.page:
                this.min = 10000;
                this.max = 20000;
                this.index = this.min;
                break;
            case LayerType.rise:
                this.min = 1000;
                this.max = 10000;
                this.index = this.min;
                break;
            case LayerType.tip:
                this.min = 50000;
                this.max = 80000;
                this.index = this.min;
                break;
        }
    }
    private type: LayerType;
    private min: number;
    private max: number;
    private index: number;
    private objectIndexs: { index: number, obj: Object }[] = [];
    zoom(user: Object): number {
        if (this.objectIndexs.some(s => s.obj === user)) {
            return this.objectIndexs.find(g => g.obj === user).index;
        }
        var i = this.index += 1;
        this.objectIndexs.push({ index: i, obj: user })
        return i;
    }
    /**
     * 使用过后，需要释放
     * @param wields 
     */
    clear(predict: ((item: { index: number, obj: Object }) => boolean) | Object) {
        if (typeof predict == 'function')
            this.objectIndexs.removeAll(predict as any);
        else this.objectIndexs.removeAll(g => g.obj == predict);
        if (this.objectIndexs.length == 0) {
            this.index = this.min;
        }
    }
}
export var popoverLayer = new Layer(LayerType.popover);
export var tipLayer = new Layer(LayerType.tip);
export var riseLayer = new Layer(LayerType.rise);
export var pageLayer = new Layer(LayerType.page);

