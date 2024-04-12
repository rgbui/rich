import { BlockUrlConstant } from "../../src/block/constant";
import { BlockCssName } from "../../src/block/pattern/css";

export enum DetectorOperator {
    firstLetterCreateBlock,
    lastLetterCreateBlock,
    letterReplaceCreateBlock,
    firstLetterTurnBlock,
    inputCharReplace
}
export type DetectorRule = {
    operator: DetectorOperator,
    match: string | RegExp | (string | RegExp)[],
    matchFn?: (value: string) => boolean,
    url?: string,
    style?: Record<any, Record<string, any>>,
    props?: Record<string, any>,
    handle?: (value: string) => string;
}
export var rules: DetectorRule[] = [
    {
        operator: DetectorOperator.firstLetterCreateBlock,
        match: ['---'],
        url: '/divider'
    },
    {
        operator: DetectorOperator.lastLetterCreateBlock,
        match: [/\-\-\-$/],
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
        match: ['+# '],
        url: '/head?{toggle:true}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: ['+## '],
        url: '/head?{level:"h2",toggle:true}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: ['+### '],
        url: '/head?{level:"h3",toggle:true}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: ['+#### '],
        url: '/head?{level:"h4",toggle:true}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: ['``` '],
        url: BlockUrlConstant.Code
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/^[\d]+[\.。] /],
        url: '/list?{listType:1}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/^[\>》] /],
        url: '/list?{listType:2}'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/^["“] /],
        url: '/quote'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/^[！!]{2} /],
        url: '/callout'
    },
    {
        operator: DetectorOperator.firstLetterTurnBlock,
        match: [/^[\*\-\+] /],
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
        style: { [BlockCssName.font]: { fontWeight: 700 } }
    },
    {
        operator: DetectorOperator.letterReplaceCreateBlock,
        match: [/\*([^*]+)\*$/],
        url: '/text',
        matchFn: (value) => {
            if (/\*\*([^*]+)\*$/.test(value)) return false;
            return true;
        },
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
        match: [/`([^`]+)`$/],
        url: '/text',
        props: { code: true }
    },
    // {
    //     operator: DetectorOperator.inputCharReplace,
    //     match: [/[\!！]\=$/],
    //     handle(value) {
    //         return value.replace(/[\!！]\=$/, '≠');
    //     }
    // },
    // {
    //     operator: DetectorOperator.inputCharReplace,
    //     match: [/[\<《]\=$/],
    //     handle(value) {
    //         return value.replace(/[\<《]\=$/, '≤');
    //     }
    // },
    // {
    //     operator: DetectorOperator.inputCharReplace,
    //     match: [/[\>》]\=$/],
    //     handle(value) {
    //         return value.replace(/[\>》]\=$/, '≥');
    //     }
    // },
    // {
    //     operator: DetectorOperator.inputCharReplace,
    //     match: [/[\<《]\-$/],
    //     handle(value) {
    //         return value.replace(/[\<《]\-$/, '←');
    //     }
    // },
    // {
    //     operator: DetectorOperator.inputCharReplace,
    //     match: [/\-[\>》]$/],
    //     handle(value) {
    //         return value.replace(/\-[\>》]$/, '→');
    //     }
    // }
];