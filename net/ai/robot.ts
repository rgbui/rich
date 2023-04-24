
import { RobotInfo, RobotTask } from "../../types/user";
import { util } from "../../util/util";
import { channel } from "../channel";
import { AskTemplate, getTemplateInstance } from "./prompt";
import { marked } from "marked"
export async function RobotRquest(robot: RobotInfo,
    task: RobotTask,
    args: Record<string, any>,
    callback: (msg: string, done?: boolean, content?: string) => Promise<void>) {
    var user = await channel.query('/query/current/user')
    if (robot.scene == 'wiki') {
        var text = args.ask + `-<a class='at-user' data-userid='${user.id}'>@${user.name}</a><br/>`;
        args.robotId = robot.robotId;
        await callback(text + "<span class='typed-print'></span>", false, text);
        try {
            var g = await channel.get('/query/wiki/answer', args as any);
            if (g.data?.contents?.length > 0) {
                var content = getTemplateInstance(AskTemplate, {
                    prompt: args.ask,
                    source: g.data.contents[0].content
                });
                await channel.post('/text/ai/stream', {
                    question: content,
                    callback(str, done) {
                        if (typeof str == 'string') text += str;
                        console.log('gggg', text);
                        callback(marked.parse(text + (done ? "" : "<span class='typed-print'></span>")), done, marked.parse(text))
                    }
                });
            }
        }
        catch (ex) {
            text += `<p class='error'>回答出错</p>`
            callback(text, true)
        }
    }
    else {
        var url = robot.basePath || '';
        if (url.endsWith('/')) url = url.slice(0, url.length - 1);
        if (task.url) url = url + (task.url.startsWith('/') ? task.url : "/" + task.url);
        var method = task.method || 'post';
        if (task.handle == 'stream') {
            await channel.post('/fetch', {
                options: { url, method, data: args }, callback: (data, done) => {
                    callback(data, done)
                }
            })
        }
        else if (task.handle == 'sync') {
            var r = await channel.post('/http', {
                url,
                method,
                data: args
            });
            var t = task.template || '';
            if (t) {
                t = t.replace(/({[^}]+})/g, function (match, key) {
                    key = key.slice(1);
                    key = key.slice(0, key.length - 1);
                    return args[key];
                })
            } else t = r.data;
            callback(t, true);
        }
    }
}


var robots: RobotInfo[];
export async function getWsRobotTasks() {
    if (Array.isArray(robots)) return robots;
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