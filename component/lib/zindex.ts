
export enum LayerType {
    /**
     * 消息提示，
     * z-index通常为最高的，
     * 用户查看消息提示
     */
    tip,
    /**
     * 弹窗对话框（用来交互处理的）
     */
    popover,
    /**
     * 起伏层（比普通视觉元素高一些些）
     */
    rise
}

export enum LayerWield {
    menuMask,
    menuBox,

    alert,
    confirm
}

class Layer {
    constructor(type: LayerType) {
        this.type = type;
        this.init()
    }
    private init() {
        switch (this.type) {
            case LayerType.popover:
                this.min = 80000;
                this.max = 90000;
                this.index = this.min;
                break;
            case LayerType.rise:
                this.min = 1000;
                this.max = 80000;
                this.index = this.min;
                break;
            case LayerType.tip:
                this.min = 90000;
                this.max = 100000;
                this.index = this.min;
                break;
        }
    }
    private type: LayerType;
    private min: number;
    private max: number;
    private index: number;
    private indexs: { index: number, wield: LayerWield }[] = [];
    zoom(wield: LayerWield): number {
        var i = this.index += 1;
        this.indexs.push({ wield, index: i });
        return i;
    }
    /**
     * 使用过后，需要释放
     * @param wields 
     */
    clear(...wields: LayerWield[]) {
        this.indexs.removeAll(g => wields.exists(x => x === g.wield));
        if (this.indexs.length == 0) {
            if (this.index > this.min + (this.max - this.min) * 0.8) {
                this.index = this.min;
            }
        }
    }
}
export var popoverLayer = new Layer(LayerType.popover);
export var tipLayer = new Layer(LayerType.tip);
export var riseLayer = new Layer(LayerType.rise);

