

export function ConvertEmbed(url: string) {
    if (/^https?\:\/\/music\.163\.com\/\#\/song\?id\=([\d]+)/.test(url)) {
        var rs = url.match(/^https?\:\/\/music\.163\.com\/\#\/song\?id\=([\d]+)/)
        if (rs[1]) {
            return { embedType: 'music.163', origin: url, url: `https://music.163.com/outchain/player?type=2&id=${rs[1]}&auto=0&height=66` }
        }
    }
    else if (/^https?\:\/\/www\.bilibili\.com\/video\/([a-zA-Z\d]+)/.test(url)) {
        var rs = url.match(/^https?\:\/\/www\.bilibili\.com\/video\/([a-zA-Z\d]+)/);
        if (rs[1]) {
            return { embedType: 'bilibili', origin: url, url: `https://player.bilibili.com/player.html?bvid=${rs[1]}&page=1&high_quality=1&as_wide=1&allowfullscreen=true` }
        }
    }
    else {
        return { origin: url, url, embedType: '' }
    }
}