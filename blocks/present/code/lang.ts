import Prism from 'prismjs';
export async function loadPrismLang(lang: string) {
    if (Prism.languages[lang.toLowerCase()]) return;
    switch (lang) {
        case 'ABAP':
            await import('prismjs/components/prism-abap')
            break;
        case 'Arduino':
            await import('prismjs/components/prism-arduino')
            break;
        case 'Bash':
            await import('prismjs/components/prism-bash')
            break;
        case 'BASIC':
            await import('prismjs/components/prism-basic')
            break;
        case 'C':
            await import('prismjs/components/prism-c')
            break;
        case 'Clojure':
            await import('prismjs/components/prism-clojure')
            break;
        case 'CoffeeScript':
            await import('prismjs/components/prism-coffeescript')
            break;
        case 'C++':
            await import('prismjs/components/prism-cpp')
            break;
        case 'C#':
            await import('prismjs/components/prism-csharp')
            break;
        case 'CSS':
            await import('prismjs/components/prism-css')
            break;
        case 'Dart':
            await import('prismjs/components/prism-dart')
            break;
        case 'Diff':
            await import('prismjs/components/prism-diff')
            break;
        case 'Docker':
            await import('prismjs/components/prism-docker')
            break;
        case 'Elixir':
            await import('prismjs/components/prism-elixir')
            break;
        case 'Elm':
            await import('prismjs/components/prism-elm')
            break;
        case 'Erlang':
            await import('prismjs/components/prism-erlang')
            break;
        case 'Flow':
            await import('prismjs/components/prism-flow')
            break;
        case 'Fortran':
            await import('prismjs/components/prism-fortran')
            break;
        case 'F#':
            await import('prismjs/components/prism-fsharp')
            break;
        case 'Gherkin':
            await import('prismjs/components/prism-gherkin')
            break;
        case 'GLSL':
            await import('prismjs/components/prism-glsl')
            break;
        case 'Go':
            await import('prismjs/components/prism-go')
            break;
        case 'GraphQL':
            await import('prismjs/components/prism-graphql')
            break;
        case 'Groovy':
            await import('prismjs/components/prism-groovy')
            break;
        case 'Haskell':
            await import('prismjs/components/prism-haskell')
            break;
        // case 'HTML':
        //     await import('prismjs/components/prism-html')
        //     break;
        case 'Java':
            await import('prismjs/components/prism-java')
            break;
        case 'JavaScript':
            await import('prismjs/components/prism-javascript')
            break;
        case 'JSON':
            await import('prismjs/components/prism-json')
            break;
        case 'Julia':
            await import('prismjs/components/prism-julia')
            break;
        case 'Kotlin':
            await import('prismjs/components/prism-kotlin')
            break;
        case 'LaTeX':
            await import('prismjs/components/prism-latex')
            break;
        case 'Less':
            await import('prismjs/components/prism-less')
            break;
        case 'Lisp':
            await import('prismjs/components/prism-lisp')
            break;
        case 'LiveScript':
            await import('prismjs/components/prism-livescript')
            break;
        case 'Lua':
            await import('prismjs/components/prism-lua')
            break;
        case 'Makefile':
            await import('prismjs/components/prism-makefile')
            break;
        case 'Markdown':
            await import('prismjs/components/prism-markdown')
            break;
        case 'Markup':
            await import('prismjs/components/prism-markup')
            break;
        case 'MATLAB':
            await import('prismjs/components/prism-matlab')
            break;
        // case 'Mermaid':
        //     await import('prismjs/components/prism-mermaid')
        //     break;
        case 'Nix':
            await import('prismjs/components/prism-nix')
            break;
        case 'Objective-C':
            await import('prismjs/components/prism-objectivec')
            break;
        case 'OCaml':
            await import('prismjs/components/prism-ocaml')
            break;
        case 'Pascal':
            await import('prismjs/components/prism-pascal')
            break;
        case 'Perl':
            await import('prismjs/components/prism-perl')
            break;
        case 'PHP':
            await import('prismjs/components/prism-php')
            break;
        // case 'Plain':
        //     await import('prismjs/components/prism-plain')
        //     break;
        // case 'Text':
        //     await import('prismjs/components/prism-text')
        //     break;
        case 'PowerShell':
            await import('prismjs/components/prism-powershell')
            break;
        case 'Prolog':
            await import('prismjs/components/prism-prolog')
            break;
        case 'Protobuf':
            await import('prismjs/components/prism-protobuf')
            break;
        case 'Python':
            await import('prismjs/components/prism-python')
            break;
        case 'R':
            await import('prismjs/components/prism-r')
            break;
        case 'Reason':
            await import('prismjs/components/prism-reason')
            break;
        case 'Ruby':
            await import('prismjs/components/prism-ruby')
            break;
        case 'Rust':
            await import('prismjs/components/prism-rust')
            break;
        case 'Sass':
            await import('prismjs/components/prism-sass')
            break;
        case 'Scala':
            await import('prismjs/components/prism-scala')
            break;
        case 'Scheme':
            await import('prismjs/components/prism-scheme')
            break;
        case 'Scss':
            await import('prismjs/components/prism-scss')
            break;
        // case 'Shell':
        //     await import('prismjs/components/prism-shell')
        //     break;
        case 'Solidity':
            await import('prismjs/components/prism-solidity')
            break;
        case 'SQL':
            await import('prismjs/components/prism-sql')
            break;
        case 'Swift':
            await import('prismjs/components/prism-swift')
            break;
        case 'TypeScript':
            await import('prismjs/components/prism-typescript')
            break;
        case 'VB.Net':
            await import('prismjs/components/prism-vbnet')
            break;
        case 'Verilog':
            await import('prismjs/components/prism-verilog')
            break;
        case 'VHDL':
            await import('prismjs/components/prism-vhdl')
            break;
        case 'Visual':
            await import('prismjs/components/prism-visual-basic')
            break;
        case 'Basic':
            await import('prismjs/components/prism-basic')
            break;
        case 'WebAssembly':
            await import('prismjs/components/prism-wasm')
            break;
        // case 'XML':
        //     await import('prismjs/components/prism-xml')
        //     break;
        case 'YAML':
            await import('prismjs/components/prism-yaml')
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
    else return n;
}
export var PrismLangLabels = ["ABAP",
    "Arduino",
    "Bash",
    "BASIC", "C", "Clojure", "CoffeeScript", "C++", "C#", "CSS", "Dart", "Diff", "Docker", "Elixir", "Elm", "Erlang", "Flow", "Fortran", "F#", "Gherkin", "GLSL", "Go", "GraphQL", "Groovy", "Haskell", "HTML", "Java", "JavaScript", "JSON", "Julia", "Kotlin", "LaTeX", "Less", "Lisp", "LiveScript", "Lua", "Makefile", "Markdown", "Markup", "MATLAB", "Nix", "Objective-C", "OCaml", "Pascal", "Perl", "PHP",
    //"Plain", "Text",
    "PowerShell", "Prolog", "Protobuf",
    "Python", "R",
    "Reason", "Ruby",
    "Rust", "Sass",
    "Scala", "Scheme",
    "Scss", "Shell", "Solidity", "SQL", "Swift", "TypeScript", "VB.Net", "Verilog", "VHDL", "Visual", "Basic", "WebAssembly", "XML", "YAML"]
