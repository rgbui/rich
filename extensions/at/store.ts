import { Directive } from "../../util/bus/directive";
import { richBus } from "../../util/bus/event.bus";
import { AtSelectorItem } from "./declare";

class AtStore {

    async find(word: string): Promise<AtSelectorItem[]> {
        var users = await richBus.fireAsync(Directive.UsersQuery);
        users = users.findAll(g => g.name.indexOf(word) > -1)
        var pages = await richBus.fireAsync(Directive.PagesQuery, word)
        return []
    }
}
export var atStore = new AtStore();