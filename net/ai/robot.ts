
import { ResourceArguments } from "../../extensions/icon/declare";
import { RobotInfo } from "../../types/user";
import { channel } from "../channel";
import { marked } from "marked";
import { lst } from "../../i18n/store";
import { parseElementUrl } from "../element.type";
import lodash from "lodash";
import { LinkPageItem } from "../../src/page/declare";
import { getAiDefaultModel } from "./cost";

import {
    AskTemplate,
    getTemplateInstance,
    getUserHistoryQuestion,
    IQuestion
} from "../../extensions/ai/prompt";

/**
 *  获取robot wikit基于ask的相关上下文参考资料
 * @param robot 
 * @param ask 
 * @param prompt 
 * @returns {
 *    context:string,
 *    notFound:boolean
 * }|null
 * 
 */
export async function getRobotWikiContext(
    robot: RobotInfo,
    ask: string,
    minRank?: number) {
    if (typeof minRank == 'undefined') minRank = 0.45;
    console.log({
        model: getAiDefaultModel(robot.embeddingModel, 'embedding'),
        robotId: robot.robotId,
        ask,
        contextSize: robot.wikiConfig?.fragmentContextSize || 10,
        size: robot.wikiConfig?.fragmentSize || 5,
        minRank
    })
    var g = await channel.get('/query/wiki/answer', {
        model: getAiDefaultModel(robot.embeddingModel, 'embedding'),
        robotId: robot.robotId,
        ask,
        contextSize: robot.wikiConfig?.fragmentContextSize || 10,
        size: robot.wikiConfig?.fragmentSize || 5,
        minRank
    });
    if (g.data?.docs?.length > 0) {
        return {
            context: g.data.docs.map(np => np.ps.map(p => p.content).join("\n\n")).join('\n\n\n\n')
        }
    }
    else {
        return {
            notFound: true
        }
    }
}

export async function getWsContext(prompt: string, minRank?: number) {
    if (typeof minRank == 'undefined') minRank = 0.45;
    var g = await channel.get('/ws/ai/search', {
        ask: prompt,
        minRank
    });
    var ms = g.data.docs.map(doc => {
        return {
            url: doc.elementUrl,
            pe: parseElementUrl(doc.elementUrl),
            blockId: doc.blockId,
            content: doc.ps.map(p => {
                return {
                    content: p.content,
                    rank: p.rank
                }
            })
        }
    });
    if (ms.length > 0) {
        var context = ms.map(m => {
            return m.content.map(c => c.content).join('\n\n')
        }).join('\n\n\n\n')
        var ids = ms.map(m => m.pe.id);
        lodash.uniqBy(ids, s => s);
        var pageItems = await channel.get('/page/items', { ids });
        var refs: { elementUrl: string, page: LinkPageItem, blockIds: string[] }[] = [];
        ms.forEach(m => {
            var rf = refs.find(r => r.elementUrl == m.url);
            if (rf) {
                rf.blockIds.push(m.blockId)
            }
            else refs.push({
                elementUrl: m.url,
                page: pageItems.data.list.find(p => p.id == m.pe.id),
                blockIds: [m.blockId]
            })
        })
        return {
            refs,
            context: context
        }
    }
    else {
        return {
            notFound: true
        }
    }
}


export async function identifyUserProblems(prompt: string, contextPrompts: string[]) {
    var content = getTemplateInstance(getUserHistoryQuestion, {
        prompt: prompt,
        context: contextPrompts.map(c => '对话：' + c + "\n")
    });
    var result = await channel.post('/text/ai', {
        input: content,
        model: getAiDefaultModel(),
    });
    return result.data?.message || prompt;
}

export async function getUserQuestions(content: string) {
    var content = getTemplateInstance(IQuestion, {
        content: content
    });
    var result = await channel.post('/text/ai', {
        input: content,
        model: getAiDefaultModel(),
    });
    var ms = [];
    var r = result.data?.message;
    if (r) {
        ms = r.split('\n').map(m => m.trim()).filter(m => m);
        ms = ms.map(m => {
            if (/^[0-9]+/.test(m)) {
                return m.replace(/^[0-9]+\.?/, '').trim();
            }
        })
    }
    return ms;
}


export async function AgentRequest(robot: RobotInfo,
    message: string,
    options: { isAt?: boolean, historyMessages?: string[] },
    callback: (options: {
        msg: string,
        done?: boolean,
        content?: string,
        files?: ResourceArguments[],
        refs?: { elementUrl: string, page: LinkPageItem, blockIds: string[] }[]
    }) => Promise<void>) {
    var user = await channel.query('/query/current/user')
    var text = message + `<a class='at-user' data-userid='${user.id}'>@${user.name}</a><br/>`;
    if (options?.isAt == true) text = '';
    await callback({ msg: text + "<span class='typed-print'></span>", done: false, content: text });
    if (options?.historyMessages && options.historyMessages.length > 0) {
        message = await identifyUserProblems(message, options.historyMessages)
    }
    var content = '';
    if (robot.disabledWiki !== true) {
        var context = await getRobotWikiContext(robot, message);
        if (context?.notFound) {
            // callback(marked.parse(text + lst('未找到匹配的答案')), true, marked.parse(text + lst('未找到匹配的答案')))
        }
        else if (context?.context) {
            content = context?.context;
        }
    }
    console.log('robot content', content);
    var refs: {
        elementUrl: string;
        page: LinkPageItem<{}>;
        blockIds: string[];
    }[] = [];
    if (robot.disabledWorkspaceSearch !== true) {
        var cc = await getWsContext(message);
        if (cc.notFound) {

        }
        else if (cc?.context) {
            content = cc.context;
            refs = cc.refs;
        }
    }
    if (content) {
        await new Promise(async (resolve, reject) => {
            var ptext = getTemplateInstance(AskTemplate, {
                prompt: message,
                context: content
            });
            await channel.post('/text/ai/stream', {
                question: ptext,
                role: robot.instructions || undefined,
                model: getAiDefaultModel(robot.model),
                callback(str, done) {
                    if (typeof str == 'string') text += str;
                    callback({ msg: marked.parse(text + (done ? "" : "<span class='typed-print'></span>")), done, content: marked.parse(text) })
                    if (done) {
                        resolve(true)
                    }
                }
            });
        })
        if (robot.abledCommandModel !== true) {

        }
    }
    else {
        callback({ msg: marked.parse(text + lst('没有搜到相关资料')), done: true, content: marked.parse(text + lst('没有搜到相关资料')) })
    }
}