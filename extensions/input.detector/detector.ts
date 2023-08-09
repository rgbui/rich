
import { DetectorOperator, DetectorRule, rules } from "./rules";
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

export function InputDetector(value: string, options: { rowStart?: boolean, rowEnd?: boolean }): { rule: DetectorRule, value: string, matchValue?: string } {
    var rs = rules.map(r => r);
    if (!options.rowStart) rs = rs.findAll(x => x.operator != DetectorOperator.firstLetterCreateBlock && x.operator != DetectorOperator.firstLetterTurnBlock);
    if (options.rowEnd) {
        if (!rs.some(x => x.operator == DetectorOperator.lastLetterCreateBlock))
            rs.push(rules.find(x => x.operator == DetectorOperator.lastLetterCreateBlock))
    }
    else rs = rs.findAll(x => x.operator != DetectorOperator.lastLetterCreateBlock)
    var ru: DetectorRule;
    for (let i = 0; i < rs.length; i++) {
        var rule = rs[i];
        if (typeof rule.matchFn == 'function' && rule.matchFn(value) != true) continue;
        var ms = Array.isArray(rule.match) ? rule.match : [rule.match];
        for (let m of ms) {
            if (typeof m == 'string' && value === m) {
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
        var matchValue: string;
        switch (ru.operator) {
            case DetectorOperator.lastLetterCreateBlock:
                value = '---';
                break;
            case DetectorOperator.firstLetterTurnBlock:
                value = '---';
                break;
            case DetectorOperator.inputCharReplace:
                if (typeof ru.handle == 'function')
                    value = ru.handle(value);
                break;
            case DetectorOperator.letterReplaceCreateBlock:
                var match = Array.isArray(ru.match) ? ru.match[0] : ru.match;
                if (match instanceof RegExp) {
                    value = value.replace(match, ($, $1) => {
                        matchValue = $1;
                        return '';
                    });
                }
                break;
        }
        return { rule: ru, value, matchValue };
    };
}

