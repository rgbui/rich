

/**
 * 参考prompt template
 * 
 * https://www.aishort.top/?tags=write
 * 
 * https://prompthero.com/chatgpt-prompts
 * 
 */

export const AskTemplate = `
参考资料:
"""
{context}
"""
问题：
{prompt}

任务:
请如实基于参考资料回答问题，
如果你不知道答案，请回答“不知道”,
请直接返回答案，
不要使用外部信息，
不要包含任何其他信息，
`

export const getUserHistoryQuestion = `
用户历史对话:
"""
{context}
"""
用户当前对话：
"""
{prompt}
"""
任务:
基于用户历史对话，对用户当前对话进行分析。
识别用户当前对话询问的真实意图 ，
请直接返回用户最可能想问的问题，不要回答。
不要包含任何其他信息。
不要使用复杂的句子结构或专业术语。
`

export const IQuestion=`
内容：
"""
{content}
"""
任务:
请基于上述的内容，从提出最多3条不同角度的问题。
要求问题是开放性的，不要求答案。
不要包含任何其他信息。
不要使用复杂的句子结构或专业术语。
`;


export const SummarizeTemplate = `你是一个擅长思考的写作小肋手，只提供总结，避免提供解释。对下面内容进行100字左右总结。总结应该简洁、清晰，并抓住内容要点，使其易于阅读和理解。避免使用复杂的句子结构或专业术语。
内容：
{content}
`
export const AbstractTemplate = `你是一个擅长思考的写作小肋手。请将下面内容缩减为简洁、连贯的短文。摘要应该包含原始文本的主要观点和关键信息，同时省略细节和冗余内容。
内容：
{content}
`
export const PolishTemplate = `你是一个擅长思考的写作小肋手。请以{style}的方式，润色下面内容。
内容：
{content}
`;
/**
 * 最常使用的 prompt，用于优化文本的语法、清晰度和简洁度，提高可读性。
 */
export const WritingAssistant = `你是一个擅长思考的写作小肋手，你的任务是提升下列内容的拼写、语法、清晰度、简洁性和整体文字的可读性，同时分解长句子，减少重复。
内容：
{content}
`

export const ArticleContinue = `你是一个擅长思考的写作小肋手。基参考下列内容续写一篇文章
内容：
{content}
`

export const TranslateTemplate = `你是一个语言翻译小肋手，只提供翻译后的文本内容，避免提供解释。将下列文本内容翻译成 {language}。
内容：
{content}
`
export const SelectionPrompt = `
内容：
"""
{selection}
"""
要求：
{prompt}
任务:
请参考内容按着要求处理。
`


export const MakeSmall = `你是一个擅长思考的写作小肋手。使下列内容文本更简洁、更容易阅读。
内容：
{content}
`
export const MakeLonger = `你是一个擅长思考的写作小肋手。使下列内容文本更长、更详细。
内容：
{content}
`


export const FixSpellingGrammar = `你是一个擅长思考的文笔写作小肋手。修正下列内容的拼写和语法错误，请直接返回修正后的内容。
内容：
{content}
 `

export const ExplainPrompt = `你是一个擅长思考的文笔写作小肋手。解释下列内容，让我们更容易理解文本所表达的意思。
内容：
{content}
`

export function getTemplateInstance(template: string, data: Record<string, any>) {
    return template.replace(/{([^}]+)}/g, function (match, key) {
        return data[key];
    });
}

export const GenMind = `你是一个擅长思考的助手。我将为你提供一个主题，你的任务是围绕主题生成思维导图，请返回markdown格式，不要返回标题，结果不要使用\`\`\`\`\`\`进行包裹。主题为“{prompt}”`



