
import { LangID } from "./declare";
import { LangProvider } from "./lib/provider";
export var langProvider = new LangProvider<LangID>('id');
langProvider.register(async (lang) => {
    var data: any = {};
    switch (lang) {
        case 'en':
            data = await import('./lang/en');
            break;
        case 'zh':
            data = await import('./lang/zh');
            break;
    }
    if (typeof data.default != 'undefined')
        return data.default;
})
