export const AskTemplate = `任务：从依据指定的信息来源回答问题。
指令：答案应该与指定的信息来源有关联，如果没关联或不确定请回答不知道。
问题：{prompt}
信息来源：{source}`

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

export const SummarizeTemplate = `任务：生成内容摘要。
指令：摘要应是内容主要观点的简要概述。
提示:请用一句简短的话概括以下内容：[{prompt}]
`
export function getTemplateInstance(template: string, data: Record<string, any>) {
    return template.replace(/{([^}]+)}/g, function (match, key) {
        return data[key];
    });
}
