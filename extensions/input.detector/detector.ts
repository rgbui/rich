import { BlockCssName } from "../../src/block/pattern/css";
import { Anchor } from "../../src/kit/selection/anchor";
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
 * 相关的触发可参考
 * 
 */
export class InputDetector extends Events {
    private rules: DetectorRule[] = [
        {
            operator: DetectorOperator.firstLetterCreateBlock,
            match: ['---'],
            url: '/divider'
        },
        {
            operator: DetectorOperator.firstLetterTurnBlock,
            match: ['# '],
            url: '/head'
        },
        {
            operator: DetectorOperator.firstLetterTurnBlock,
            match: ['## '],
            url: '/head?{level:"h2"}'
        },
        {
            operator: DetectorOperator.firstLetterTurnBlock,
            match: ['### '],
            url: '/head?{level:"h3"}'
        },
        {
            operator: DetectorOperator.firstLetterTurnBlock,
            match: ['#### '],
            url: '/head?{level:"h4"}'
        },
        {
            operator: DetectorOperator.firstLetterTurnBlock,
            match: ['[]', '【】'],
            url: '/todo'
        },
        {
            operator: DetectorOperator.letterReplaceCreateBlock,
            match: [/\*\*([^*]+)\*\*$/],
            url: '/text',
            style: { [BlockCssName.font]: { fontWeight: 500 } }
        },
        {
            operator: DetectorOperator.letterReplaceCreateBlock,
            match: [/`([^]+)`$/],
            url: '/code'
        },
        {
            operator: DetectorOperator.inputCharReplace,
            match: ['！='],
            handle(value) {
                if (value == '！=') return '≠'
                return value;
            }
        }
    ];
    match(value: string, anchor: Anchor, options: { start?: number }) {
        var rs = this.rules;
        if (options.start > 0) rs = rs.findAll(x => x.operator != DetectorOperator.firstLetterCreateBlock && x.operator != DetectorOperator.firstLetterTurnBlock);
        var ru: DetectorRule;
        for (let i = 0; i < rs.length; i++) {
            var rule = rs[i];
            var ms = Array.isArray(rule.match) ? rule.match : [rule.match];
            for (let m of ms) {
                if (typeof m == 'string' && value == m) {
                    ru = rule;
                    break;
                }
                else if (m instanceof RegExp && m.test(value)) {
                    ru = rule;
                    break;
                }
            }
        }
        if (ru) {
            var lastValue: string;
            switch (ru.operator) {
                case DetectorOperator.firstLetterCreateBlock:
                    value = '';
                    break;
                case DetectorOperator.firstLetterTurnBlock:
                    value = '';
                    break;
                case DetectorOperator.inputCharReplace:
                    if (typeof ru.handle == 'function')
                        value = ru.handle(value);
                    break;
                case DetectorOperator.letterReplaceCreateBlock:
                    var match = Array.isArray(ru.match) ? ru.match[0] : ru.match;
                    if (match instanceof RegExp) {
                        value = value.replace(match, ($, $1) => {
                            lastValue = $1;
                            return '';
                        });
                    }
                    break;
            }
            this.emit('input', ru, value, lastValue);
        };
    }
}
export interface InputDetector {
    on(name: 'input', fn: (rule: DetectorRule, value: string, lastValue?: string) => void);
    emit(name: 'input', rule: DetectorRule, value: string, lastValue?: string);
}
export enum DetectorOperator {
    firstLetterCreateBlock,
    letterReplaceCreateBlock,
    firstLetterTurnBlock,
    inputCharReplace
}
export type DetectorRule = {
    operator: DetectorOperator,
    match: string | RegExp | (string | RegExp)[],
    url?: string,
    style?: Record<string, Record<string, any>>,
    handle?: (value: string) => string;
}