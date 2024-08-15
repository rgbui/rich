import { testParseHtmlTs } from "./parse.html"



function TestCode() {
    testParseHtmlTs()
}

window.addEventListener('DOMContentLoaded', () => {
    if (window.shyConfig.isDev)
        TestCode()
})

