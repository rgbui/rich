

/**
 * 参考prompt template
 * 
 * https://www.aishort.top/?tags=write
 * 
 * https://prompthero.com/chatgpt-prompts
 * 
 */


export const AskTemplate = `任务：从依据指定的信息来源回答问题。
指令：答案应该与指定的信息来源有关联，如果没关联或不确定请回答不知道。
问题：{prompt}
信息来源：{context}`

export const TheRelevanceOfQuestionsToKnowledge = `任务：判断问题与信息是否关联。
问题：今天是星期几？
信息来源：[content]众所周知，法国总统马克龙将于4月5日至7日对中国进行国事访问，期间还将赴广州参观访问。[contentEnd]
回答：否
问题：明天天气如何？
信息来源：[content]今天温度20度，明天温度30度，后天温度40度？[contentEnd]
回答：是
问题：{prompt}
信息来源：[content]{source}[contentEnd]
回答：`

// export const SummarizeTemplate = `任务：生成内容摘要。
// 指令：摘要应是内容主要观点的简要概述。
// 提示:请用一句简短的话概括以下内容：[{prompt}]
// `
export const SummarizeTemplate = `Summarize the following text into 100 words, making it easy to read and comprehend. The summary should be concise, clear, and capture the main points of the text. Avoid using complex sentence structures or technical jargon. Respond in Chinese. Please begin by editing the following text:{content} `
export const AbstractTemplate = `对下列内容生成摘要:{content}`;
export const PolishTemplate=`请以{style}的方式，润色下列内容:{content}`;
/**
 * 最常使用的 prompt，用于优化文本的语法、清晰度和简洁度，提高可读性。
 */
export const WritingAssistant = `As a writing improvement assistant, your task is to improve the spelling, grammar, clarity, concision, and overall readability of the text provided, while breaking down long sentences, reducing repetition, and providing suggestions for improvement. Please provide only the corrected Chinese version of the text and avoid including explanations. Please begin by editing the following text: [{content}]`;

export const ArticleContinue = `Continue writing an article in Chinese , begins with the following sentence: [{content}]`

export const TranslateTemplate = `Translate the following text into {language}: [{content}]`
export const SelectionPrompt = `待优化内容:\n\n [{selection}]----------------------------\n\n 请按下面的方式对待优化内容进行处理:\n\n [{prompt}]`
export const SelectionRobotPrompt = `参考内容:\n\n [{context}]----------------------------\n\n待优化内容:\n\n [{selection}]----------------------------\n\n 请基于参考内容按下面的方式对待优化内容进行处理:\n\n [{prompt}]`
export const PromptRobot=`参考内容:\n\n [{context}]----------------------------\n\n请基于参考内容按下面的要求进行回答:\n\n [{prompt}]`
export const MakeSmall = `Respond in Chinese. Make the following text more concise and easier to read: [{content}]`
export const MakeLonger = `Respond in Chinese. Make the following text longer and more detailed: [{content}]`
/**
 * 👉 将文本改写成类似小红书的 Emoji 风格。
 */
export const RedBook = `Please edit the following passage using the Emoji style, which is characterized by captivating headlines, the inclusion of emoticons in each paragraph, and the addition of relevant tags at the end. Be sure to maintain the original meaning of the text. Please begin by editing the following text: [{content}]`

/**
 * 👉 通过为提供的图像描述填充详细且有创意的描述，激发 Midjourney 生成独特有趣的图像。
 * 这也适用于 Stable Diffusion。
 * 或者使用我的另一款工具 IMGPrompt，可以在导航栏中找到链接
 */
export const ImagePrompt = `I want you to act as a prompt generator for Midjourney's artificial intelligence program. Your job is to provide detailed and creative descriptions that will inspire unique and interesting images from the AI. Keep in mind that the AI is capable of understanding a wide range of language and can interpret abstract concepts, so feel free to be as imaginative and descriptive as possible. For example, you could describe a scene from a futuristic city, or a surreal landscape filled with strange creatures. The more detailed and imaginative your description, the more interesting the resulting image will be. Respond in English. Here is your first prompt: [{content}]`


export const FixSpellingGrammar = `Respond in Chinese. Fix the spelling and grammar of the following text: [{content}]`
export const ExplainPrompt = 'Respond in Chinese. Explain these things: [{content}]';

export function getTemplateInstance(template: string, data: Record<string, any>) {
    return template.replace(/{([^}]+)}/g, function (match, key) {
        return data[key];
    });
}

export const GenMind=`你是一个擅长思考的助手。我将为你提供一个主题，你的任务是围绕主题生成思维导图，请返回markdown格式，不要返回标题，结果不要使用\`\`\`\`\`\`进行包裹。主题为“{prompt}”`



