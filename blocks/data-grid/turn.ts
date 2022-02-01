import { Block } from "../../src/block";

export var DataGridTurns = {
    urls: [
        '/data-grid/table',
        '/data-grid/board',
        '/data-grid/calendar',
        '/data-grid/list',
        '/data-grid/gallery',
        '/data-grid/timeline',
        '/data-grid/map',
    ],
    async turn(block: Block, turnToUrl) {
        var data: Record<string, any> = {};
        switch (turnToUrl) {
            case '/data-grid/table':
            case '/data-grid/board':
            case '/data-grid/calendar':
            case '/data-grid/list':
            case '/data-grid/gallery':
            case '/data-grid/timeline':
            case '/data-grid/map':
                data.schemaId = (block as any).schemaId;
                var re = { url: turnToUrl, ...data };
               
                return re;
                break;
        }
    }
}