var strRegex = "((https|http|ws|wss|ftp|rtsp|mms)?://)"
    + "(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?" //ftp的user@ 
    + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184 
    + "|" // 允许IP和DOMAIN（域名）
    + "([0-9a-zA-Z_!~*'()-]+\.)*" // 域名- www. 
    + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\." // 二级域名 
    + "[a-zA-Z]{2,6})" // first level domain- .com or .museum 
    + "(:[0-9]{1,4})?" // 端口- :80 
    + "((/?)|" // a slash isn't required if there is no file name 
    + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)";

/**
 * Url_Regex进行test时，会死机
 * 像这种网址 https://js.design/community?category=detail&type=resource&id=6577c8d8c52c65da01689c60
 * 会导致死机
 */
export var URL_RGEX = new RegExp('^' + strRegex + '$');


export function isUrl(url: string) {
    if (typeof url !== 'string') return false;
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
        if (/^https?:\/\/([\d\-a-zA-Z\.]+)(:[\d]+)?/.test(url)) return true;
        return false
    }
    else return false;
}


export var URL_END_REGEX = new RegExp(strRegex + "$");


export function getTextLink(text) {
    const reg = new RegExp(strRegex, 'g');
    return text.replace(reg, function (m, p) {
        // console.log(m, p);
        return '<a href="' + m + '" target="_blank">' + m + '</a>'
    })
}
