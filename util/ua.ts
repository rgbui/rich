
//https://github.com/faisalman/ua-parser-js
import UAParser from 'ua-parser-js';
var parser = new UAParser();
var result = parser.getResult();
export var UA = {
    isMacOs: result.os.name.indexOf("Mac") > -1,
    isWindows:result.os.name.indexOf('Windows')>-1,
    browser: result.browser,
    device: result.device,
    os: result.os,
    engine: result.engine,
    cpu: result.cpu,
}