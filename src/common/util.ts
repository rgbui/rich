export function parseBlockUrl(url: string) {
    if (url.indexOf('?') > -1) {
        var us = url.split('?');
        var parms = us[1];
        var data: Record<string, any> = {};
        if (typeof parms == 'string' && parms.startsWith('{')) {
            try {
                data = window.eval('(' + parms + ')');
            }
            catch (ex) {
                console.error(ex);
            }
        }
        return {
            url: us[0],
            data
        }
    }
    else return {
        url,
        data: {}
    }
}