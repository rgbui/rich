import lodash from 'lodash';
import Prism from 'prismjs';
export async function loadPrismLang(lang: string) {
    if (Prism.languages[lang]) return 'exists';
    switch (lang) {
        case 'ABAP'.toLowerCase():
            return await import('prismjs/components/prism-abap')
            break;
        case 'Arduino'.toLowerCase():
            return await import('prismjs/components/prism-arduino')
            break;
        case 'Bash'.toLowerCase():
            return await import('prismjs/components/prism-bash')
            break;
        case 'BASIC'.toLowerCase():
            return await import('prismjs/components/prism-basic')
            break;
        case 'C'.toLowerCase():
            return await import('prismjs/components/prism-c')
            break;
        case 'Clojure'.toLowerCase():
            return await import('prismjs/components/prism-clojure')
            break;
        case 'CoffeeScript'.toLowerCase():
            return await import('prismjs/components/prism-coffeescript')
            break;
        case 'clike'.toLowerCase():
            return await import('prismjs/components/prism-cpp')
            break;
        case 'csharp'.toLowerCase():
            return await import('prismjs/components/prism-csharp')
            break;
        case 'CSS'.toLowerCase():
            return await import('prismjs/components/prism-css')
            break;
        case 'Dart'.toLowerCase():
            return await import('prismjs/components/prism-dart')
            break;
        case 'Diff'.toLowerCase():
            return await import('prismjs/components/prism-diff')
            break;
        case 'Docker'.toLowerCase():
            return await import('prismjs/components/prism-docker')
            break;
        case 'Elixir'.toLowerCase():
            return await import('prismjs/components/prism-elixir')
            break;
        case 'Elm'.toLowerCase():
            return await import('prismjs/components/prism-elm')
            break;
        case 'Erlang'.toLowerCase():
            return await import('prismjs/components/prism-erlang')
            break;
        case 'Flow'.toLowerCase():
            return await import('prismjs/components/prism-flow')
            break;
        case 'Fortran'.toLowerCase():
            return await import('prismjs/components/prism-fortran')
            break;
        case 'fsharp'.toLowerCase():
            return await import('prismjs/components/prism-fsharp')
            break;
        case 'Gherkin'.toLowerCase():
            return await import('prismjs/components/prism-gherkin')
            break;
        case 'GLSL'.toLowerCase():
            return await import('prismjs/components/prism-glsl')
            break;
        case 'Go'.toLowerCase():
            return await import('prismjs/components/prism-go')
            break;
        case 'GraphQL'.toLowerCase():
            return await import('prismjs/components/prism-graphql')
            break;
        case 'Groovy'.toLowerCase():
            return await import('prismjs/components/prism-groovy')
            break;
        case 'Haskell'.toLowerCase():
            return await import('prismjs/components/prism-haskell')
            break;
        // case 'HTML'.toLowerCase():
        //     await import('prismjs/components/prism-html')
        //     break;
        case 'Java'.toLowerCase():
            return await import('prismjs/components/prism-java')
            break;
        case 'JavaScript'.toLowerCase():
            return await import('prismjs/components/prism-javascript')
            break;
        case 'JSON'.toLowerCase():
            return await import('prismjs/components/prism-json')
            break;
        case 'Julia'.toLowerCase():
            return await import('prismjs/components/prism-julia')
            break;
        case 'Kotlin'.toLowerCase():
            return await import('prismjs/components/prism-kotlin')
            break;
        case 'LaTeX'.toLowerCase():
            return await import('prismjs/components/prism-latex')
            break;
        case 'Less'.toLowerCase():
            return await import('prismjs/components/prism-less')
            break;
        case 'Lisp'.toLowerCase():
            return await import('prismjs/components/prism-lisp')
            break;
        case 'LiveScript'.toLowerCase():
            return await import('prismjs/components/prism-livescript')
            break;
        case 'Lua'.toLowerCase():
            return await import('prismjs/components/prism-lua')
            break;
        case 'Makefile'.toLowerCase():
            return await import('prismjs/components/prism-makefile')
            break;
        case 'Markdown'.toLowerCase():
            return await import('prismjs/components/prism-markdown')
            break;
        case 'Markup'.toLowerCase():
            return await import('prismjs/components/prism-markup')
            break;
        case 'MATLAB'.toLowerCase():
            return await import('prismjs/components/prism-matlab')
            break;
        // case 'Mermaid'.toLowerCase():
        //     await import('prismjs/components/prism-mermaid')
        //     break;
        case 'Nix'.toLowerCase():
            return await import('prismjs/components/prism-nix')
            break;
        case 'objc'.toLowerCase():
            return await import('prismjs/components/prism-objectivec')
            break;
        case 'OCaml'.toLowerCase():
            return await import('prismjs/components/prism-ocaml')
            break;
        case 'Pascal'.toLowerCase():
            return await import('prismjs/components/prism-pascal')
            break;
        case 'Perl'.toLowerCase():
            return await import('prismjs/components/prism-perl')
            break;
        case 'PHP'.toLowerCase():
            return await import('prismjs/components/prism-php')
            break;
        // case 'Plain'.toLowerCase():
        //     await import('prismjs/components/prism-plain')
        //     break;
        // case 'Text'.toLowerCase():
        //     await import('prismjs/components/prism-text')
        //     break;
        case 'PowerShell'.toLowerCase():
            return await import('prismjs/components/prism-powershell')
            break;
        case 'Prolog'.toLowerCase():
            return await import('prismjs/components/prism-prolog')
            break;
        case 'Protobuf'.toLowerCase():
            return await import('prismjs/components/prism-protobuf')
            break;
        case 'Python'.toLowerCase():
            return await import('prismjs/components/prism-python')
            break;
        case 'R'.toLowerCase():
            return await import('prismjs/components/prism-r')
            break;
        case 'Reason'.toLowerCase():
            return await import('prismjs/components/prism-reason')
            break;
        case 'Ruby'.toLowerCase():
            return await import('prismjs/components/prism-ruby')
            break;
        case 'Rust'.toLowerCase():
            return await import('prismjs/components/prism-rust')
            break;
        case 'Sass'.toLowerCase():
            return await import('prismjs/components/prism-sass')
            break;
        case 'Scala'.toLowerCase():
            return await import('prismjs/components/prism-scala')
            break;
        case 'Scheme'.toLowerCase():
            return await import('prismjs/components/prism-scheme')
            break;
        case 'Scss'.toLowerCase():
            return await import('prismjs/components/prism-scss')
            break;
        // case 'Shell'.toLowerCase():
        //     await import('prismjs/components/prism-shell')
        //     break;
        case 'Solidity'.toLowerCase():
            return await import('prismjs/components/prism-solidity')
            break;
        case 'SQL'.toLowerCase():
            return await import('prismjs/components/prism-sql')
            break;
        case 'Swift'.toLowerCase():
            return await import('prismjs/components/prism-swift')
            break;
        case 'TypeScript'.toLowerCase():
            return await import('prismjs/components/prism-typescript')
            break;
        case 'vbnet'.toLowerCase():
            return await import('prismjs/components/prism-vbnet')
            break;
        case 'Verilog'.toLowerCase():
            return await import('prismjs/components/prism-verilog')
            break;
        case 'VHDL'.toLowerCase():
            return await import('prismjs/components/prism-vhdl')
            break;
        case 'visual-basic'.toLowerCase():
            return await import('prismjs/components/prism-visual-basic')
            break;
        case 'Basic'.toLowerCase():
            return await import('prismjs/components/prism-basic')
            break;
        case 'wasm'.toLowerCase():
            return await import('prismjs/components/prism-wasm')
            break;
        // case 'XML'.toLowerCase():
        //     await import('prismjs/components/prism-xml')
        //     break;
        case 'YAML'.toLowerCase():
            return await import('prismjs/components/prism-yaml')
            break;
    }
}
export function PrismLabelToLang(label: string) {
    var n = label.toLowerCase();
    if (n == 'c++') return 'cpp'
    else if (n == 'f#') return 'fsharp'
    else if (n == 'WebAssembly'.toLowerCase()) return 'wasm'
    else if (n == 'Visual'.toLowerCase()) return 'visual-basic'
    else if (n == 'Objective-C'.toLowerCase()) return 'object-c';
    else if (n == 'c') return 'clike';
    else return n;
}
export var PrismLangLabels = [
    { "label": "ABAP", "language": "abap" },
    { "label": "Arduino", "language": "arduino" },
    { "label": "Bash", "language": "bash" },
    { "label": "BASIC", "language": "basic" },
    { "label": "C", "language": "c", sort: 30 },
    { "label": "Clojure", "language": "clojure" },
    { "label": "CoffeeScript", "language": "coffeescript" },
    { "label": "C++", "language": "clike", sort: 31 },
    { "label": "C#", "language": "csharp", sort: 9 },
    { "label": "CSS", "language": "css", sort: 18 },
    { "label": "Dart", "language": "dart", sort: 15 },
    { "label": "Diff", "language": "diff" },
    { "label": "Docker", "language": "docker" },
    { "label": "Elixir", "language": "elixir" },
    { "label": "Elm", "language": "elm" },
    { "label": "Erlang", "language": "erlang" },
    { "label": "Flow", "language": "flow" },

    { "label": "Fortran", "language": "fortran" },
    { "label": "F#", "language": "fsharp" ,sort:32},
    { "label": "Gherkin", "language": "gherkin" },
    { "label": "GLSL", "language": "glsl" },
    { "label": "Go", "language": "go", sort: 13 },
    { "label": "GraphQL", "language": "graphql" },
    { "label": "Groovy", "language": "groovy" },
    { "label": "Haskell", "language": "haskell" },
    { "label": "HTML", "language": "html", sort: 8 },
    { "label": "Java", "language": "java", sort: 2 },
    { "label": "JavaScript", "language": "javascript",sort:5 },
    { "label": "JSON", "language": "json", sort: 19 },
    { "label": "Julia", "language": "julia" ,sort:24},
    { "label": "Kotlin", "language": "kotlin", sort: 15 },
    { "label": "LaTeX", "language": "latex" },
    { "label": "Less", "language": "less",sort:26 },
    { "label": "Lisp", "language": "lisp" },
    { "label": "LiveScript", "language": "livescript" },
    { "label": "Lua", "language": "lua" },
    { "label": "Makefile", "language": "makefile" },
    { "label": "Markdown", "language": "markdown", sort: 12 },
    { "label": "Markup", "language": "markup" },
    { "label": "MATLAB", "language": "matlab" },
    { "label": "Nix", "language": "nix" },
    // { "label": "Objective-C", "language": "objc" },
    { "label": "OCaml", "language": "ocaml" },
    { "label": "Pascal", "language": "pascal" },
    { "label": "Perl", "language": "perl" },
    { "label": "PHP", "language": "php", sort: 22 },
    { "label": "PowerShell", "language": "powershell", sort: 25 },
    { "label": "Prolog", "language": "prolog" },
    { "label": "Protobuf", "language": "protobuf", sort: 23 },
    { "label": "Python", "language": "python", sort: 6 },
    { "label": "R", "language": "r", sort: 27 },
    { "label": "Reason", "language": "reason" },
    { "label": "Ruby", "language": "ruby" },
    { "label": "Rust", "language": "rust" },
    { "label": "Sass", "language": "sass" },
    { "label": "Scala", "language": "scala" },
    { "label": "Scheme", "language": "scheme" },
    { "label": "Scss", "language": "scss" },
    { "label": "Shell", "language": "shell",sort:29 },
    { "label": "Solidity", "language": "solidity" },
    { "label": "SQL", "language": "sql" ,sort:23},
    { "label": "Swift", "language": "swift" ,sort:16},
    { "label": "TypeScript", "language": "typescript", sort: 1 },
    { "label": "VB.Net", "language": "vbnet" },
    { "label": "Verilog", "language": "verilog" },
    { "label": "VHDL", "language": "vhdl" },
    { "label": "Visual", "language": "visual-basic" },
    { "label": "Basic", "language": "basic" },
    { "label": "WebAssembly", "language": "wasm" },
    { "label": "XML", "language": "xml", sort: 20 },
    { "label": "YAML", "language": "yaml", sort: 21 }
];
PrismLangLabels = lodash.sortBy(PrismLangLabels, 'sort');