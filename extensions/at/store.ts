import { Directive } from "../../util/bus/directive";
import { messageChannel } from "../../util/bus/event.bus";
import { AtSelectorItem } from "./declare";

class AtStore {

    async find(word: string): Promise<AtSelectorItem[]> {
        var users = await messageChannel.fireAsync(Directive.UsersQuery);
        users = users.findAll(g => g.name.indexOf(word) > -1)
        var pages = await messageChannel.fireAsync(Directive.PagesQuery, word)
        return []
    }
}
export var atStore = new AtStore();