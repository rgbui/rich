
import { ResourceArguments } from "../../extensions/icon/declare";
import { RobotInfo, RobotTask } from "../../types/user";
import { util } from "../../util/util";
import { channel } from "../channel";
import { AskTemplate, getTemplateInstance } from "../../extensions/ai/prompt";
import { marked } from "marked"
import { lst } from "../../i18n/store";

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
export async function getRobotWikiContext(robot: RobotInfo,
    ask: string, prompt: string)
    {
    if (prompt.indexOf('{context}') > -1 && robot.disabledWiki !== true && ask) {
        var g = await channel.get('/query/wiki/answer', {
            model: robot.embeddingModel || (window.shyConfig.isUS ? "gpt" : "Baidu-Embedding-V1"),
            robotId: robot.robotId,
            ask,
            contextSize: robot.wikiConfig?.fragmentContextSize || 10,
            size: robot.wikiConfig?.fragmentSize || 5
        });
        if (g.data?.docs?.length > 0) {
            var minLower = robot.wikiConfig?.minLowerRank || 0.3;
            if (g.data.docs[0].ps.exists(g => g.rank > minLower)) {
                var nps = g.data.docs.findAll(g => g.ps.exists(c => c.rank > minLower));
                return {
                    context: nps.map(np => np.ps.map(p => p.content).join("\n\n")).join('\n\n\n\n')
                }
            }
            else return {
                notFound: true
            }
        }
    }
    return null;
}


export async function RobotRquest(robot: RobotInfo,
    task: RobotTask,
    args: Record<string, any>, options: {
        isAt: boolean,
        prompt?: ArrayOf<RobotInfo['prompts']>
    } = { isAt: false },
    callback: (msg: string, done?: boolean, content?: string, files?: ResourceArguments[]) => Promise<void>) {
    var user = await channel.query('/query/current/user')
    if (robot.scene == 'wiki') {
        var text = args.ask + `<a class='at-user' data-userid='${user.id}'>@${user.name}</a><br/>`;
        if (options.isAt) text = '';
        args.robotId = robot.robotId;
        await callback(text + "<span class='typed-print'></span>", false, text);
        try {
            var template = options?.prompt?.prompt || AskTemplate;
            var content = '';
            var context = await getRobotWikiContext(robot, args.ask, template);
            if (!context) content = getTemplateInstance(template, {
                prompt: args.ask
            });
            else if (context.notFound) {
                callback(marked.parse(text + lst('未找到匹配的答案')), true, marked.parse(text + lst('未找到匹配的答案')))
                return;
            }
            else {
                content = getTemplateInstance(template, {
                    prompt: args.ask,
                    context: context.context
                });
            }
            await channel.post('/text/ai/stream', {
                question: content,
                model: robot.model || (window.shyConfig.isUS ? "gpt-3.5-turbo" : "ERNIE-Bot-turbo"),
                callback(str, done) {
                    if (typeof str == 'string') text += str;
                    callback(marked.parse(text + (done ? "" : "<span class='typed-print'></span>")), done, marked.parse(text))
                }
            });
        }
        catch (ex) {
            text += `<p class='error'>${lst('回答出错')}</p>`
            console.error(ex)
            callback(text, true)
        }
    }
    else {
        var url = robot.basePath || '';
        if (url.endsWith('/')) url = url.slice(0, url.length - 1);
        if (task.url.startsWith('http')) url = task.url;
        else if (task.url) url = url + (task.url.startsWith('/') ? task.url : "/" + task.url);
        var method = task.method || 'post';
        if (task.handle == 'stream') {
            var ks = Object.keys(args)
            var cts = ks.length == 1 ? args[ks[0]] : ks.map(c => `${c}:${args[c]}`).join('<br/>')
            var text = cts + `-<a class='at-user' data-userid='${user.id}'>@${user.name}</a><br/>`;
            if (options.isAt) text = '';
            await callback(text + "<span class='typed-print'></span>", false, text);
            await channel.post('/fetch', {
                url,
                method,
                data: args,
                callback: (str, done) => {
                    if (typeof str == 'string') text += str;
                    callback(marked.parse(text + (done ? "" : "<span class='typed-print'></span>")), done, marked.parse(text))
                }
            })
        }
        else if (task.handle == 'sync') {
            var text = '';
            if (task.replys[0]?.mime == 'image') {
                var ks = Object.keys(args)
                var cts = ks.length == 1 ? args[ks[0]] : ks.map(c => `${c}:${args[c]}`).join('<br/>')
                text = cts + `-<a class='at-user' data-userid='${user.id}'>@${user.name}</a><br/>`;
                await callback(text + "<span class='typed-print'></span>", false, text);
            }
            try {
                var r = await channel.post('/http', {
                    url,
                    method,
                    data: args
                });
                if (task.replys[0]?.mime == 'image') {
                    await callback(text, true, text, r.data.images);
                }
                else {
                    var t = task.template || '';
                    if (t) {
                        t = t.replace(/({[^}]+})/g, function (match, key) {
                            key = key.slice(1);
                            key = key.slice(0, key.length - 1);
                            return args[key];
                        })
                    } else t = r.data;
                    callback(t, true, t);
                }
            }
            catch (ex) {
                console.error(ex);
                if (task.replys[0]?.mime == 'image') {
                    text += `<p class='error'>${lst('响应出错')}</p>`
                    callback(text, true)
                }
                else {
                    text += `<p class='error'>${lst('响应出错')}</p>`
                    callback(text, true)
                }
            }
        }
    }
}


var robots: RobotInfo[];
var robotsDate: number;

/**
 * 获取空间内所有的机器人
 * 包括空间内部创建的及空间添加别人的
 * @returns 
 */
export async function getWsRobots() {
    try {
        if (Array.isArray(robots) && robotsDate && robotsDate > Date.now() - 1000 * 60 * 1) return robots;
        var gs = await channel.get('/ws/robots');
        if (gs.ok) {
            var rs = await channel.get('/robots/info', { ids: gs.data.list.map(g => g.userid) });
            if (rs.ok) {
                robots = rs.data.list;
                robotsDate = new Date().getTime();
                robots.forEach(robot => {
                    if (robot.scene == 'wiki') {
                        robot.tasks = [
                            {
                                id: util.guid(),
                                name: '问题',
                                args: [
                                    {
                                        id: util.guid(),
                                        text: lst("问题"),
                                        name: 'ask', type: 'string'
                                    }
                                ]
                            }
                        ]
                    }
                })
            }
        }
    }
    catch (ex) {
        console.error(ex);
    }
    finally {
        return robots || [];
    }
}


export async function getWsWikiRobots() {
    var rs = await getWsRobots();
    return rs.findAll(g => g.scene == 'wiki');
}