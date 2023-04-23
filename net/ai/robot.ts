
import { RobotInfo, RobotTask } from "../../types/user";
import { channel } from "../channel";
import { AskTemplate, getTemplateInstance } from "./prompt";

export async function getRobotInput(robot: RobotInfo,
    task: RobotTask,
    args?: Record<string, any>,
    callback?: (msg: string) => void) {
    if (robot.scene == 'wiki') {
        args.robotId = robot.id;
        var g = await channel.get('/query/wiki/answer', args as any);
        if (g.data?.contents?.length > 0) {
            var content = getTemplateInstance(AskTemplate, {
                ask: args.ask,
                source: g.data.contents[0].content
            });
            await channel.post('/text/ai/stream', {
                question: content,
                callback(str, done) {
                    if (typeof callback == 'function')
                        callback(str)
                }
            })
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
                    if (typeof callback == 'function')
                        callback(data)
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
            return t;
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
        }
    }
    return robots;
}