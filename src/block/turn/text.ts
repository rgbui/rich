import { Block } from "..";

export var TextTurns = {
    urls: [
        '/textspan',
        '/todo',
        '/head',
        '/head?{level:"h2"}',
        '/head?{level:"h3"}',
        '/head?{level:"h4"}',
        '/list?{listType:1}',
        '/list?{listType:0}',
        '/list?{listType:2}',
        '/quote',
        '/callout'
    ],
    async turn(block: Block, turnToUrl) {
        switch (turnToUrl) {
            case '/textspan':
            case '/todo':
            case '/head':
            case '/head?{level:"h2"}':
            case '/head?{level:"h3"}':
            case '/head?{level:"h4"}':
            case '/list?{listType:1}':
            case '/list?{listType:0}':
            case '/list?{listType:2}':
            case '/quote':
            case '/callout':
                var data = await block.get();
                delete data.url;
                delete data.id;
                delete data.date;
                if (block.url.startsWith('/head')) delete data.level;
                if (block.url.startsWith('/list')) delete data.listType;
                if (block.url == '/todo') delete data.checked;
                return { url: turnToUrl, ...data }
                break;
        }
    }
}