import { Block } from "../../src/block";

export var TableStoreTurns = {
    urls: [
        '/table/store',
        '/data-grid/board',
        '/data-grid/calendar',
        '/data-grid/list',
        '/data-grid/gallery',
        '/data-grid/gantt',
        '/data-grid/timeline',
        '/data-grid/map',
    ],
    async turn(block: Block, turnToUrl) {
        var data: Record<string, any> = {};
        switch (turnToUrl) {
            case '/table/store':
            case '/data-grid/board':
            case '/data-grid/calendar':
            case '/data-grid/list':
            case '/data-grid/gallery':
            case '/data-grid/gantt':
            case '/data-grid/timeline':
            case '/data-grid/map':
                data.schemaId = (block as any).schemaId;
                return { url: turnToUrl, ...data }
                break;
        }
    }
}