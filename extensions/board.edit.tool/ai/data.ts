import { Edit1Svg } from "../../../component/svgs";
import { MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";

export var getBoardAIItems = () => {
    return [
        {
            name: 'improveWrite',
            text: lst('提升写作'),
            value: `你是一个擅长思考的写作小肋手，你的任务是提升下列内容的拼写、语法、清晰度、简洁性和整体文字的可读性，同时分解长句子，减少重复。
内容：
{content}

    `, icon: { name: 'byte', code: 'optimize' },
        },
        {
            name: 'fix', text: lst('拼写及语法优化'), value: `你是一个擅长思考的文笔写作小肋手。修正下列内容的拼写和语法错误，请直接返回修正后的内容。
内容：
{content}
 `,
            icon: { name: 'byte', code: 'modify' }
        },
        {
            name: 'explain', text: lst('解释'), value: `你是一个擅长思考的文笔写作小肋手。解释下列内容，让我们更容易理解文本所表达的意思。
内容：
{content}
`, icon: { name: 'byte', code: 'transform' }
        },
        {
            name: 'summary', text: lst('总结'), value: `你是一个擅长思考的写作小肋手，只提供总结，避免提供解释。对下面内容进行100字左右总结。总结应该简洁、清晰，并抓住内容要点，使其易于阅读和理解。避免使用复杂的句子结构或专业术语。
内容：
{content}
`, icon: { name: 'byte', code: 'converging-gateway' }
        },
        {
            name: 'abstract', value: `你是一个擅长思考的写作小肋手。请将下面内容缩减为简洁、连贯的短文。摘要应该包含原始文本的主要观点和关键信息，同时省略细节和冗余内容。
内容：
{content}
`, text: lst('摘要'), icon: { name: 'byte', code: 'magic-wand' }
        },
        {
            text: lst("翻译"),
            childsPos: { align: 'end' },
            childs: [
                {
                    text: lst('中文'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成中文。
内容：
{content}
`  },
                {
                    text: lst('英文'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成英文。
内容：
{content}
`  },
                {
                    text: lst('日文'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成日文。
内容：
{content}
`  },
                {
                    text: lst('韩文'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成韩文。
内容：
{content}
`   },
                {
                    text: lst('德语'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成德语。
内容：
{content}
`   },
                {
                    text: lst('法语'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成法语。
内容：
{content}
`  },
                {
                    text: lst('俄语'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成俄语。
内容：
{content}
`  },
                {
                    text: lst('意大利'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成意大利。
内容：
{content}
`  },
                {
                    text: lst('葡萄牙'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成葡萄牙。
内容：
{content}
`  },
                {
                    text: lst('西班牙'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成西班牙。
内容：
{content}
`   },
                {
                    text: lst('荷兰'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成荷兰。
内容：
{content}
`   },
                {
                    text: lst('阿拉伯'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成阿拉伯。
内容：
{content}
`  },
                {
                    text: lst('印度尼西亚'), name: 'translate', value: `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列内容翻译成印度尼西亚。
内容：
{content}ent}
"""
`  },
            ],
            icon: { name: 'byte', code: 'translation' }
        },
        { type: MenuItemType.divide },
        {
            name: 'makeLonger',
            text: lst('变长一些'),

            value: `你是一个擅长思考的写作小肋手。使下列内容文本更长、更详细。
内容：
{content}
`,
            icon: { name: 'byte', code: 'indent-right' }
        },
        {
            name: 'makeSmaller', text: lst('简洁一些'), value: `你是一个擅长思考的写作小肋手。使下列内容文本更简洁、更容易阅读。
            内容：
            {content}
            `,

            icon: { name: 'byte', code: 'indent-left' }
        },
        {
            text: lst('润色'),
            icon: { name: 'byte', code: 'effects' },
            childs: [
                {
                    name: 'polish',
                    text: lst('更专业一些'),
                    icon: Edit1Svg,
                    value: `你是一个擅长思考的写作小肋手。请以更专业一些的方式，润色下面的内容。
内容：
{content}
` },
                {
                    name: 'polish', text: lst('更友好一些'), icon: Edit1Svg,
                    value: `你是一个擅长思考的写作小肋手。请以更友好一些的方式，润色下面的内容。
内容：
{content}
` },
                {
                    name: 'polish', text: lst('更自信一些'), icon: Edit1Svg,
                    value: `你是一个擅长思考的写作小肋手。请以更自信一些的方式，润色下面的内容。
内容：
{content}
`  },
                {
                    name: 'polish', text: lst('更直接一些'), icon: Edit1Svg,
                    value: `你是一个擅长思考的写作小肋手。请以更直接一些的方式，润色下面的内容。
内容：
{content}
` },
                {
                    name: 'polish', text: lst('更口语话一些'), icon: Edit1Svg,
                    value: `你是一个擅长思考的写作小肋手。请以更口语话一些的方式，润色下面的内容。
内容：
{content}
`  },
            ]
        }
    ];
}