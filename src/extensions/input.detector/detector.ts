import { Events } from "../../util/events";
/**
 * 输入检测器
 * 当输入的时候，检测到特定的字符时，触发一些动作
 * 输入---则直接创建一个分割线
 * 输入#+空格，则将当前的block转成一个大小标题
 * 输入**字符**时，则直接将当前的字符转成一个粗体的文本
 * 输入`字符`时，则直接将当前的字符转成一个code模式
 * 输入[]则转成一个待办block
 * 
 * 相关的触发可参考https://www.notion.so/Writing-editing-basics-68c7c67047494fdb87d50185429df93e
 */
export class InputDetector extends Events {

}

export enum DetectorOperator {
    firstLetterCreateBlock,
    firstLetterTurnBlock
}


export type DetectorRule = {

}