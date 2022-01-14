///<reference path='./lib/paper.d.ts'/>

var paper
export async function loadPaper() {
    if (typeof paper == 'undefined') {
        var r = await import(
            /* webpackChunkName: 'paper' */
            /* webpackPrefetch: true */
            './lib/paper-full.js'
        );
        paper=r.paper;
        paper.install(window);
        var canvas = document.createElement('canvas');
        paper.setup(canvas);
    }
    return paper;
}