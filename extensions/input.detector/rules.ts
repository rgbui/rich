import { BlockCssName } from "../../src/block/pattern/css";

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
    style?: Record<any, Record<string, any>>,
    handle?: (value: string) => string;
}
export var rules: DetectorRule[] = [
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
        match: [/[\d]+[\.。] /],
        url: '/list?{listType:1}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/[\>] /],
        url: '/list?{listType:2}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/["“] /],
        url: '/quote'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/[\*\-\+] /],
        url: '/list?{listType:0}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/^\[\]/, /^【】/],
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
        match: [/\*([^*]+)\*$/],
        url: '/text',
        style: { [BlockCssName.font]: { fontStyle: 'italic' } }
    },
    {
        operator: DetectorOperator.letterReplaceCreateBlock,
        match: [/~([^~]+)~$/],
        url: '/text',
        style: { [BlockCssName.font]: { textDecoration: 'line-through' } }
    },
    {
        operator: DetectorOperator.letterReplaceCreateBlock,
        match: [/`([^]+)`$/],
        url: '/text?{isCode:true}'
    },
    {
        operator: DetectorOperator.inputCharReplace,
        match: [/[\!！]\=$/],
        handle(value) {
            return value.replace(/[\!！]\=$/, '≠');
        }
    },
    {
        operator: DetectorOperator.inputCharReplace,
        match: [/[\<《]\=$/],
        handle(value) {
            return value.replace(/[\<《]\=$/, '≤');
        }
    },
    {
        operator: DetectorOperator.inputCharReplace,
        match: [/[\>》]\=$/],
        handle(value) {
            return value.replace(/[\>》]\=$/, '≥');
        }
    },
    {
        operator: DetectorOperator.inputCharReplace,
        match: [/[\<《]\-$/],
        handle(value) {
            return value.replace(/[\<《]\-$/, '←');
        }
    },
    {
        operator: DetectorOperator.inputCharReplace,
        match: [/\-[\>》]$/],
        handle(value) {
            return value.replace(/\-[\>》]$/, '→');
        }
    }
];