import { Block } from "../../src/block";

export var TableStoreTurns = {
    urls: [
        '/table/store',
        '/datagrid/board',
        '/tablestore/calendar',
        '/tablestore/list',
        '/tablestore/gallery',
        '/tablestore/gantt',
        '/tablestore/timeline',
        '/tablestore/map',
    ],
    async turn(block: Block, turnToUrl) {
        var data: Record<string, any> = {};
        switch (turnToUrl) {
            case '/table/store':
            case '/tablestore/board':
            case '/tablestore/calendar':
            case '/tablestore/list':
            case '/tablestore/gallery':
            case '/tablestore/gantt':
            case '/tablestore/timeline':
            case '/tablestore/map':
                return { url: turnToUrl, ...data }
                break;
        }
    }
}