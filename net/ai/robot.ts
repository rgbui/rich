
import { ResourceArguments } from "../../extensions/icon/declare";
import { RobotInfo, RobotTask } from "../../types/user";
import { util } from "../../util/util";
import { channel } from "../channel";
import { AskTemplate, getTemplateInstance } from "../../extensions/ai/prompt";
import { marked } from "marked"
export async function RobotRquest(robot: RobotInfo,
    task: RobotTask,
    args: Record<string, any>,
    callback: (msg: string, done?: boolean, content?: string, files?: ResourceArguments[]) => Promise<void>) {
    var user = await channel.query('/query/current/user')
    if (robot.scene == 'wiki') {
        var text = args.ask + `<a class='at-user' data-userid='${user.id}'>@${user.name}</a><br/>`;
        args.robotId = robot.robotId;
        await callback(text + "<span class='typed-print'></span>", false, text);
        try {
            var g = await channel.get('/query/wiki/answer', args as any);
            if (g.data?.contents?.length > 0) {
                var content = getTemplateInstance(AskTemplate, {
                    prompt: args.ask,
                    context: g.data.contents[0].content
                });
                await channel.post('/text/ai/stream', {
                    question: content,
                    callback(str, done) {
                        if (typeof str == 'string') text += str;
                        callback(marked.parse(text + (done ? "" : "<span class='typed-print'></span>")), done, marked.parse(text))
                    }
                });
            }
        }
        catch (ex) {
            text += `<p class='error'>回答出错</p>`
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
                    text += `<p class='error'>响应出错</p>`
                    callback(text, true)
                }
                else {
                    text += `<p class='error'>响应出错</p>`
                    callback(text, true)
                }
            }

        }
    }
}



export async function RobotWikiRequest(
    robot: RobotInfo,
    prompt: ArrayOf<RobotInfo['prompts']>,
    args: Record<string, any>,
    callback: (msg: string, done?: boolean, content?: string, files?: ResourceArguments[]) => Promise<void>) {
    var text = '';
    args.robotId = robot.robotId;
    await callback(text + "<span class='typed-print'></span>", false, text);
    try {
        var g = await channel.get('/query/wiki/answer', args as any);
        if (g.data?.contents?.length > 0) {
            var content = getTemplateInstance(prompt.prompt, {
                ...args.ask,
                context: g.data.contents[0].content
            });
            await channel.post('/text/ai/stream', {
                question: content,
                callback(str, done) {
                    if (typeof str == 'string') text += str;
                    callback(marked.parse(text + (done ? "" : "<span class='typed-print'></span>")), done, marked.parse(text))
                }
            });
        }
    }
    catch (ex) {
        text += `<p class='error'>回答出错</p>`
        console.error(ex)
        callback(text, true)
    }
}

var robots: RobotInfo[];
export async function getWsRobotTasks()
{
    var gs = await channel.get('/ws/robots');
    if (gs.ok) {
        var rs = await channel.get('/robots/info', { ids: gs.data.list.map(g => g.userid) });
        if (rs.ok) {
            robots = rs.data.list;
            robots.forEach(robot => {
                if (robot.scene == 'wiki') {
                    robot.tasks = [
                        {
                            id: util.guid(),
                            name: '问题',
                            args: [
                                {
                                    id: util.guid(),
                                    text: "问题",
                                    name: 'ask', type: 'string'
                                }
                            ]
                        }
                    ]
                }
            })
        }
    }
    return robots;
}

export async function getWsWikiRobots() {
    var robots: RobotInfo[];
    var gs = await channel.get('/ws/robots');
    if (gs.ok) {
        var rs = await channel.get('/robots/info', { ids: gs.data.list.map(g => g.userid) });
        if (rs.ok) {
            robots = rs.data.list;
            robots = robots.findAll(g => g.scene == 'wiki');
        }
    }
    return robots;
}