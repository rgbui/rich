

/**
 * 定义错误，
 * 该错误都是业务性的且致命的，
 * 如果报出这样的错误，需要修复代码
 * 对于当前这样的错误，也需要记录下来，传至服务器
 */
export enum ExceptionType {

    /**
     * 一个文本的block没有找到相对应的textdom
     * 该错误发生的原因 
     * 1. 当前的block配置错误
     * 2. 在编辑中由于某种原因，当前的text没有找到
     */
    notFoundTextEle,
    /**
     * 一个小的操作没有申明动作
     * 发生于对某个block的操作，需要先申明一个动作，然后记录一系列小的操作
     * 该错误会
     */
    notDeclareAction
}

/**
 * 自定义异常
 */
export class Exception extends Error {
    constructor(type: ExceptionType, message?: string) {
        super();
        this.name = ExceptionType[type];
        this.message = message;
    }
}