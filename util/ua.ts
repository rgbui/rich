
//https://github.com/faisalman/ua-parser-js
import UAParser from 'ua-parser-js';
var parser = new UAParser();
var result = parser.getResult();
export var UA = {
    isMacOs: result.os.name.indexOf("Mac") > -1
}