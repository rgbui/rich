

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
    notFoundSolidEle,
    /**
     * 没有保存上次的申明操作
     * 发生于对某个block的操作，需要先申明一个动作，然后记录一系列小的操作
     * 该错误会
     */
    notStoreLastAction,
    /**
     * 没在注册动作指令在历史记快照中
     */
    notRegisterActionDirectiveInHistorySnapshoot,
    notTextSelection,
    notFoundBlockCssName,
    overlayCssNameNotEqual,
    notUser,
    fontStyleLineHeightIsNumber,
    /**
     * 表格tableschema只有在创建中才能使用，
     * 正常加载不会为空
     */
    tableSchemaNotEmpty,
    notFoundBlockUrl,
    /**
     * 布局的block下面没有内容block
     */
     layoutBlockNotFoundContentBlock
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

/**
 * 一个警告，
 * 注意该警告只是为了提示，仍然执行后续动作，
 * 但这并不是说当前就没有错误,只是该错误不影响后续的代码执行
 * 一些无关紧要的警告，则调用 console.warn 即可
 */
export class Warn extends Error {
    constructor(type: ExceptionType, message?: string) {
        super();
        this.name = ExceptionType[type];
        this.message = message;
    }
}