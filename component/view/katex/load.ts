import { SyncLoad } from "../../lib/sync";
import "../../../node_modules/katex/dist/katex.min.css";


var sc = new SyncLoad<any>()


export async function loadKatex() {
  return await sc.create((c) => {
    (async () => {
      var r = await import(
        /* webpackChunkName: 'katex' */
        'katex')
      c(r);
    })()
  });
}



