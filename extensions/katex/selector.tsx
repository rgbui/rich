import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverPosition } from "../popover/position";
import { PopoverSingleton } from "../popover/popover";
import { Katex } from "../../component/view/katex";
import { lst } from "../../i18n/store";
import lodash from "lodash";
import { util } from "../../util/util";

function sp(s) {
    var list = lodash.split(s, '\\').map(e => `\\${e}`)
    lodash.remove(list, e => e == '\\')
    return list;
}

var katexMaps =()=>({
    'ab':
        [
            "alpha",
            "beta",
            "gamma",
            "delta",
            "epsilon",
            "varepsilon",
            "zeta",
            "eta",
            "theta",
            "vartheta",
            "iota",
            "kappa",
            "lambda",
            "mu",
            "nu",
            "xi",
            "pi",
            "varpi",
            "varrho",
            "sigma",
            "varsigma",
            "tau",
            "upsilon",
            "phi",
            "varphi",
            "chi",
            "psi",
            "omega",
            "Gamma",
            "Delta",
            "Theta",
            "Lambda",
            "Xi",
            "Pi",
            "Sigma",
            "Upsilon",
            "Phi",
            "Psi",
            "Omega"
        ].map(e => `\\${e}`),
    logic: [
        {
            text: lst('二元运算符'),
            latexs: [
                "\\pm",
                "\\cap",
                "\\diamond",
                "\\oplus",
                "\\mp",
                "\\cup",
                "\\bigtriangleup",
                "\\ominus",
                "\\times",
                "\\uplus",
                "\\bigtriangledown",
                "\\otimes",
                "\\div",
                "\\sqcap",
                "\\triangleright",
                "\\oslash",
                "\\cdot",
                "\\sqcup",
                "\\triangleleft",
                "\\odot",
                "\\star",
                "\\ast",
                "\\vee",
                "\\amalg",
                "\\bigcirc",
                "\\setminus",
                "\\wedge",
                "\\dagger",
                "\\circ",
                "\\bullet",
                "\\wr",
                "\\ddagger"
            ]
        },
        {
            text: lst('大运算符'),
            latexs: ["sum", "prod", "coprod", "bigcup", "bigcap", "bigsqcup", "bigvee", "bigwedge", "biguplus", "int", "oint", "bigodot", "bigoplus", "bigotimes"].map(e => `\\${e}`)
        }
    ],
    'relation': sp('\\leq\\geq\\equiv\\models\\prec\\succ\\sim\\perp\\preceq\\succeq\\simeq\\ll\\gg\\asymp\\parallel\\subset\\supset\\approx\\smile\\subseteq\\supseteq\\cong\\frown\\sqsubseteq\\sqsupseteq\\doteq\\neq\\in\\ni\\propto\\notin\\vdash\\dashv\\bowtie'),
    formual: [
        "x_{a}",
        "x^{b}",
        "x_{a}^{b}",
        "\\bar{x}",
        "\\tilde{x}",
        "\\frac{a}{b}",
        "\\sqrt{x}",
        "\\sqrt[n]{x}",
        "\\prod_{a}^{b}",
        "\\coprod_{a}^{b}",
        // "\\left( x ",
        // "\\right)",
        // "\\left[ x ",
        // "\\right]",
        // "\\left| x ",
        // "\\right|",
        "\\int_{a}^{b}",
        "\\oint_{a}^{b}",
        "\\sum_{a}^{b}{x}"
    ],

    arrow: sp('\\leftarrow\\rightarrow\\downarrow\\uparrow\\updownarrow\\leftrightarrow\\Leftarrow\\Rightarrow\\Downarrow\\Uparrow\\Updownarrow\\Leftrightarrow\\Longleftrightarrow\\Longleftarrow\\Longrightarrow\\longleftrightarrow\\longleftarrow\\longrightarrow\\leftharpoondown\\rightharpoondown\\mapsto\\longmapsto\\nwarrow\\nearrow\\leftharpoonup\\rightharpoonup\\hookleftarrow\\hookrightarrow\\swarrow\\searrow\\rightleftharpoons'),
    h2o: [
        // "\\ce{X_aY_b}",
        // "\\ce{X^n+}",
        // "\\ce{Y^n-}",
        // "\\ce{^A_ZX}",
        "\\ce{A",
        "\\bond{-}B}",
        "\\ce{A",
        "\\bond{=}B}",
        "\\bond{#}B}",
        "\\ce{A*B}",
        "\\ce{->}",
        "\\ce{<-}",
        "\\ce{<->}",
        "\\ce{<-->}",
        "\\ce{<=>}",
        "\\ce{<=>>}",
        "\\ce{<<=>}",
        "\\ce{^}",
        "\\ce{v}",
        "\\ce{->[{text above}][{text below}]}"
    ]
})
class KatexSelector extends EventsComponent {
    type: string;
    katexs: (string | { text: string, katexs: string[] })[] = [];
    async open(type: string) {
        this.type = type;
        this.katexs = katexMaps()[type];
        this.forceUpdate(async () => {
            await util.delay(50);
            this.emit('update')
        });
    }
    render() {
        var self = this;
        function rs(katesx) {
            return <div className="flex  flex-wrap">{katesx.map(katex => {
                return <Katex onMouseDown={e => { self.emit('save', katex) }} className={'item-hover padding-w-5 padding-h-3 round cursor'} key={katex} latex={katex}></Katex>
            })}</div>
        }
        return <div className="bg-white padding-14 round max-w-250">
            {typeof this.katexs[0] == 'string' && rs(this.katexs)}
            {typeof this.katexs[0] == 'object' && this.katexs.map((e, i) => {
                var c = (e as any) as { text: string, latexs: string[] };
                return <div key={i} className="gap-b-10">
                    <div className="remark f-12 ">{c.text}</div>
                    {rs(c.latexs)}
                </div>
            })}
        </div>
    }
}

let katexSelector;
export async function useKatexSelector(pos: PopoverPosition, type: string, listen?: (data) => void) {
    let popover = await PopoverSingleton(KatexSelector);
    katexSelector = await popover.open(pos);
    await katexSelector.open(type);
    return new Promise((resolve: (data: string) => void, reject) => {
        katexSelector.only('input', (data) => {
            if (listen) listen(data)
        })
        katexSelector.only('save', (data) => {
            popover.close();
            resolve(data);
        })
        katexSelector.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        katexSelector.only('update', () => {
            popover.updateLayout()
        })
        popover.only('close', () => {
            resolve(undefined)
        })
    })
}
export function closeKatexSelector() {
    if (katexSelector)
        katexSelector.emit('close')
}