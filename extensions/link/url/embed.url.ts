

export function ConvertEmbed(url: string): { origin: string, url: string, embedType: EmbedType } {
    if (/^https?\:\/\/music\.163\.com\/\#\/song\?id\=([\d]+)/.test(url)) {
        var rs = url.match(/^https?\:\/\/music\.163\.com\/\#\/song\?id\=([\d]+)/)
        if (rs && rs[1]) {
            return { embedType: 'music.163', origin: url, url: `https://music.163.com/outchain/player?type=2&id=${rs[1]}&auto=0&height=66` }
        }
    }
    else if (/^https?\:\/\/www\.bilibili\.com\/video\/([a-zA-Z\d]+)/.test(url)) {
        var rs = url.match(/^https?\:\/\/www\.bilibili\.com\/video\/([a-zA-Z\d]+)/);
        if (rs && rs[1]) {
            return { embedType: 'bilibili', origin: url, url: `https://player.bilibili.com/player.html?bvid=${rs[1]}&page=1&high_quality=1&as_wide=1&allowfullscreen=true` }
        }
    }
    else if (/^https?\:\/\/www\.figma\.com\//.test(url)) {
        // var rs = url.match(/^https?\:\/\/www\.figma\.com\//);
        // if (rs[0]) {
        return { embedType: 'figma', origin: url, url: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}` }
        // }
    }
    else if (/^https?\:\/\/(www\.)?mastergo\.com\/goto\//.test(url)) {
        return { embedType: 'mastergo', origin: url, url: url }
    }
    else if (/^https\:\/\/v\.qq.com\/x\/cover\//.test(url)) {
        var rs = url.match(/^https\:\/\/v\.qq.com\/x\/cover\/([\w\d]+)\/([\w\d]+)\.html/);
        if (rs && rs[2]) {
            var vid = rs[2];
            return {
                embedType: 'vqq',
                origin: url,
                url: 'https://v.qq.com/txp/iframe/player.html?vid=' + vid
            }
        }
    }
    else if (/^https\:\/\/www\.youtube\.com\/watch\?v\=([\w\d]+)/.test(url) || /^https\:\/\/youtu\.be\/([\w\d]+)/.test(url)) {
        var id: string;
        if (/^https\:\/\/www\.youtube\.com\/watch\?v\=([\w\d]+)/.test(url)) {
            var rs = url.match(/^https\:\/\/www\.youtube\.com\/watch\?v\=([\w\d]+)/);
            id = rs[1];
        }
        else {
            var rs = url.match(/^https\:\/\/youtu\.be\/([\w\d]+)/);
            id = rs[1];
        }
        if (id) {
            return { embedType: 'ytob', origin: url, url: `https://www.youtube.com/embed/${id}` }
        }
    }
    else if (/^https\:\/\/v\.youku.com\/v_show\/id_([\w\d]+)==\.html/.test(url)) {
        var rs = url.match(/^https\:\/\/v\.youku.com\/v_show\/id_([\w\d]+)==\.html/);
        if (rs && rs[1]) {
            return { embedType: 'youku', origin: url, url: `https://player.youku.com/embed/${rs[1]}==` }
        }
    }
    else {
        return { origin: url, url, embedType: '' }
    }
}

export type EmbedType = 'music.163' | 'vqq' | 'youku' | 'ytob' | 'bilibili' | 'figma' | 'mastergo' |  "bookmark" | ''; 