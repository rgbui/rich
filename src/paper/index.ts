///<reference path='./lib/paper.d.ts'/>

export async function loadPaper() {
    var r = await import(
        /* webpackChunkName: 'paper' */
        /* webpackPrefetch: true */
        './lib/paper-full.js'
    );
    console.log(r);
}