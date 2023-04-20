
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
            var content = getTemplateInstance(AskTemplate, { ask: args.ask, source: g.data.contents[0].content });
            await channel.post('/text/ai/stream', {
                question: content,
                callback(str, done) {
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

    }
}