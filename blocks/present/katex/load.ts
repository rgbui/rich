import "../../../node_modules/katex/dist/katex.min.css";

export async function loadKatex() {
    return await import(
          /* webpackChunkName: 'katex' */
        'katex')
}