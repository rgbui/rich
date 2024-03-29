import { SyncLoad } from '../../../component/lib/sync'


var sc = new SyncLoad<any>()


export async function loadCodeMirror() {
    return await sc.create((c) => {
        (async () => {
            var r = await import(
                /* webpackChunkName: 'codemirror' */
                '../../../src/assert/codemirror/lib/codemirror.js'
            );
            var CodeMirror = r.default;
            (window as any).CodeMirror = CodeMirror;
            c(CodeMirror);
        })()
    });
}




export function getCodeMirrorModes() {
    return [
        { mode: "apl", load: async () => await import('../../../src/assert/codemirror/mode/apl/apl.js') },
        { mode: "asciiarmor", load: async () => await import('../../../src/assert/codemirror/mode/asciiarmor/asciiarmor.js') },
        { mode: "asn.1", load: async () => await import('../../../src/assert/codemirror/mode/asn.1/asn.1.js') },
        { mode: "asterisk", load: async () => await import('../../../src/assert/codemirror/mode/asterisk/asterisk.js') },
        { mode: "brainfuck", load: async () => await import('../../../src/assert/codemirror/mode/brainfuck/brainfuck.js') },
        { mode: "clike", load: async () => await import('../../../src/assert/codemirror/mode/clike/clike.js') },
        { mode: "clojure", load: async () => await import('../../../src/assert/codemirror/mode/clojure/clojure.js') },
        { mode: "cmake", load: async () => await import('../../../src/assert/codemirror/mode/cmake/cmake.js') },
        { mode: "cobol", load: async () => await import('../../../src/assert/codemirror/mode/cobol/cobol.js') },
        { mode: "coffeescript", load: async () => await import('../../../src/assert/codemirror/mode/coffeescript/coffeescript.js') },
        { mode: "commonlisp", load: async () => await import('../../../src/assert/codemirror/mode/commonlisp/commonlisp.js') },
        { mode: "crystal", load: async () => await import('../../../src/assert/codemirror/mode/crystal/crystal.js') },
        { mode: "css", load: async () => await import('../../../src/assert/codemirror/mode/css/css.js') },
        { mode: "cypher", load: async () => await import('../../../src/assert/codemirror/mode/cypher/cypher.js') },
        { mode: "d", load: async () => await import('../../../src/assert/codemirror/mode/d/d.js') },
        { mode: "dart", load: async () => await import('../../../src/assert/codemirror/mode/dart/dart.js') },
        { mode: "diff", load: async () => await import('../../../src/assert/codemirror/mode/diff/diff.js') },
        { mode: "django", load: async () => await import('../../../src/assert/codemirror/mode/django/django.js') },
        { mode: "dockerfile", load: async () => await import('../../../src/assert/codemirror/mode/dockerfile/dockerfile.js') },
        { mode: "dtd", load: async () => await import('../../../src/assert/codemirror/mode/dtd/dtd.js') },
        { mode: "dylan", load: async () => await import('../../../src/assert/codemirror/mode/dylan/dylan.js') },
        { mode: "ebnf", load: async () => await import('../../../src/assert/codemirror/mode/ebnf/ebnf.js') },
        { mode: "ecl", load: async () => await import('../../../src/assert/codemirror/mode/ecl/ecl.js') },
        { mode: "eiffel", load: async () => await import('../../../src/assert/codemirror/mode/eiffel/eiffel.js') },
        { mode: "elm", load: async () => await import('../../../src/assert/codemirror/mode/elm/elm.js') },
        { mode: "erlang", load: async () => await import('../../../src/assert/codemirror/mode/erlang/erlang.js') },
        { mode: "factor", load: async () => await import('../../../src/assert/codemirror/mode/factor/factor.js') },
        { mode: "fcl", load: async () => await import('../../../src/assert/codemirror/mode/fcl/fcl.js') },
        { mode: "forth", load: async () => await import('../../../src/assert/codemirror/mode/forth/forth.js') },
        { mode: "fortran", load: async () => await import('../../../src/assert/codemirror/mode/fortran/fortran.js') },
        { mode: "gas", load: async () => await import('../../../src/assert/codemirror/mode/gas/gas.js') },
        { mode: "gfm", load: async () => await import('../../../src/assert/codemirror/mode/gfm/gfm.js') },
        { mode: "gherkin", load: async () => await import('../../../src/assert/codemirror/mode/gherkin/gherkin.js') },
        { mode: "go", load: async () => await import('../../../src/assert/codemirror/mode/go/go.js') },
        { mode: "groovy", load: async () => await import('../../../src/assert/codemirror/mode/groovy/groovy.js') },
        { mode: "haml", load: async () => await import('../../../src/assert/codemirror/mode/haml/haml.js') },
        { mode: "handlebars", load: async () => await import('../../../src/assert/codemirror/mode/handlebars/handlebars.js') },
        { mode: "haskell", load: async () => await import('../../../src/assert/codemirror/mode/haskell/haskell.js') },
        { mode: "haskell-literate", load: async () => await import('../../../src/assert/codemirror/mode/haskell-literate/haskell-literate.js') },
        { mode: "haxe", load: async () => await import('../../../src/assert/codemirror/mode/haxe/haxe.js') },
        { mode: "htmlembedded", load: async () => await import('../../../src/assert/codemirror/mode/htmlembedded/htmlembedded.js') },
        { mode: "htmlmixed", load: async () => await import('../../../src/assert/codemirror/mode/htmlmixed/htmlmixed.js') },
        { mode: "http", load: async () => await import('../../../src/assert/codemirror/mode/http/http.js') },
        { mode: "idl", load: async () => await import('../../../src/assert/codemirror/mode/idl/idl.js') },
        { mode: "javascript", load: async () => await import('../../../src/assert/codemirror/mode/javascript/javascript.js') },
        { mode: "jinja2", load: async () => await import('../../../src/assert/codemirror/mode/jinja2/jinja2.js') },
        { mode: "jsx", load: async () => await import('../../../src/assert/codemirror/mode/jsx/jsx.js') },
        { mode: "julia", load: async () => await import('../../../src/assert/codemirror/mode/julia/julia.js') },
        { mode: "livescript", load: async () => await import('../../../src/assert/codemirror/mode/livescript/livescript.js') },
        { mode: "lua", load: async () => await import('../../../src/assert/codemirror/mode/lua/lua.js') },
        { mode: "markdown", load: async () => await import('../../../src/assert/codemirror/mode/markdown/markdown.js') },
        { mode: "mathematica", load: async () => await import('../../../src/assert/codemirror/mode/mathematica/mathematica.js') },
        { mode: "mbox", load: async () => await import('../../../src/assert/codemirror/mode/mbox/mbox.js') },
        { mode: "mirc", load: async () => await import('../../../src/assert/codemirror/mode/mirc/mirc.js') },
        { mode: "mllike", load: async () => await import('../../../src/assert/codemirror/mode/mllike/mllike.js') },
        { mode: "modelica", load: async () => await import('../../../src/assert/codemirror/mode/modelica/modelica.js') },
        { mode: "mscgen", load: async () => await import('../../../src/assert/codemirror/mode/mscgen/mscgen.js') },
        { mode: "mumps", load: async () => await import('../../../src/assert/codemirror/mode/mumps/mumps.js') },
        { mode: "nginx", load: async () => await import('../../../src/assert/codemirror/mode/nginx/nginx.js') },
        { mode: "nsis", load: async () => await import('../../../src/assert/codemirror/mode/nsis/nsis.js') },
        { mode: "ntriples", load: async () => await import('../../../src/assert/codemirror/mode/ntriples/ntriples.js') },
        { mode: "octave", load: async () => await import('../../../src/assert/codemirror/mode/octave/octave.js') },
        { mode: "oz", load: async () => await import('../../../src/assert/codemirror/mode/oz/oz.js') },
        { mode: "pascal", load: async () => await import('../../../src/assert/codemirror/mode/pascal/pascal.js') },
        { mode: "pegjs", load: async () => await import('../../../src/assert/codemirror/mode/pegjs/pegjs.js') },
        { mode: "perl", load: async () => await import('../../../src/assert/codemirror/mode/perl/perl.js') },
        { mode: "php", load: async () => await import('../../../src/assert/codemirror/mode/php/php.js') },
        { mode: "pig", load: async () => await import('../../../src/assert/codemirror/mode/pig/pig.js') },
        { mode: "powershell", load: async () => await import('../../../src/assert/codemirror/mode/powershell/powershell.js') },
        { mode: "properties", load: async () => await import('../../../src/assert/codemirror/mode/properties/properties.js') },
        { mode: "protobuf", load: async () => await import('../../../src/assert/codemirror/mode/protobuf/protobuf.js') },
        { mode: "pug", load: async () => await import('../../../src/assert/codemirror/mode/pug/pug.js') },
        { mode: "puppet", load: async () => await import('../../../src/assert/codemirror/mode/puppet/puppet.js') },
        { mode: "python", load: async () => await import('../../../src/assert/codemirror/mode/python/python.js') },
        { mode: "q", load: async () => await import('../../../src/assert/codemirror/mode/q/q.js') },
        { mode: "r", load: async () => await import('../../../src/assert/codemirror/mode/r/r.js') },
        { mode: "rpm", load: async () => await import('../../../src/assert/codemirror/mode/rpm/rpm.js') },
        { mode: "rst", load: async () => await import('../../../src/assert/codemirror/mode/rst/rst.js') },
        { mode: "ruby", load: async () => await import('../../../src/assert/codemirror/mode/ruby/ruby.js') },
        { mode: "rust", load: async () => await import('../../../src/assert/codemirror/mode/rust/rust.js') },
        { mode: "sas", load: async () => await import('../../../src/assert/codemirror/mode/sas/sas.js') },
        { mode: "sass", load: async () => await import('../../../src/assert/codemirror/mode/sass/sass.js') },
        { mode: "scheme", load: async () => await import('../../../src/assert/codemirror/mode/scheme/scheme.js') },
        { mode: "shell", load: async () => await import('../../../src/assert/codemirror/mode/shell/shell.js') },
        { mode: "sieve", load: async () => await import('../../../src/assert/codemirror/mode/sieve/sieve.js') },
        { mode: "slim", load: async () => await import('../../../src/assert/codemirror/mode/slim/slim.js') },
        { mode: "smalltalk", load: async () => await import('../../../src/assert/codemirror/mode/smalltalk/smalltalk.js') },
        { mode: "smarty", load: async () => await import('../../../src/assert/codemirror/mode/smarty/smarty.js') },
        { mode: "solr", load: async () => await import('../../../src/assert/codemirror/mode/solr/solr.js') },
        { mode: "soy", load: async () => await import('../../../src/assert/codemirror/mode/soy/soy.js') },
        { mode: "sparql", load: async () => await import('../../../src/assert/codemirror/mode/sparql/sparql.js') },
        { mode: "spreadsheet", load: async () => await import('../../../src/assert/codemirror/mode/spreadsheet/spreadsheet.js') },
        { mode: "sql", load: async () => await import('../../../src/assert/codemirror/mode/sql/sql.js') },
        { mode: "stex", load: async () => await import('../../../src/assert/codemirror/mode/stex/stex.js') },
        { mode: "stylus", load: async () => await import('../../../src/assert/codemirror/mode/stylus/stylus.js') },
        { mode: "swift", load: async () => await import('../../../src/assert/codemirror/mode/swift/swift.js') },
        { mode: "tcl", load: async () => await import('../../../src/assert/codemirror/mode/tcl/tcl.js') },
        { mode: "textile", load: async () => await import('../../../src/assert/codemirror/mode/textile/textile.js') },
        { mode: "tiddlywiki", load: async () => await import('../../../src/assert/codemirror/mode/tiddlywiki/tiddlywiki.js') },
        { mode: "tiki", load: async () => await import('../../../src/assert/codemirror/mode/tiki/tiki.js') },
        { mode: "toml", load: async () => await import('../../../src/assert/codemirror/mode/toml/toml.js') },
        { mode: "tornado", load: async () => await import('../../../src/assert/codemirror/mode/tornado/tornado.js') },
        { mode: "troff", load: async () => await import('../../../src/assert/codemirror/mode/troff/troff.js') },
        { mode: "ttcn", load: async () => await import('../../../src/assert/codemirror/mode/ttcn/ttcn.js') },
        { mode: "ttcn-cfg", load: async () => await import('../../../src/assert/codemirror/mode/ttcn-cfg/ttcn-cfg.js') },
        { mode: "turtle", load: async () => await import('../../../src/assert/codemirror/mode/turtle/turtle.js') },
        { mode: "twig", load: async () => await import('../../../src/assert/codemirror/mode/twig/twig.js') },
        { mode: "vb", load: async () => await import('../../../src/assert/codemirror/mode/vb/vb.js') },
        { mode: "vbscript", load: async () => await import('../../../src/assert/codemirror/mode/vbscript/vbscript.js') },
        { mode: "velocity", load: async () => await import('../../../src/assert/codemirror/mode/velocity/velocity.js') },
        { mode: "verilog", load: async () => await import('../../../src/assert/codemirror/mode/verilog/verilog.js') },
        { mode: "vhdl", load: async () => await import('../../../src/assert/codemirror/mode/vhdl/vhdl.js') },
        { mode: "vue", load: async () => await import('../../../src/assert/codemirror/mode/vue/vue.js') },
        { mode: "wast", load: async () => await import('../../../src/assert/codemirror/mode/wast/wast.js') },
        { mode: "webidl", load: async () => await import('../../../src/assert/codemirror/mode/webidl/webidl.js') },
        { mode: "xml", load: async () => await import('../../../src/assert/codemirror/mode/xml/xml.js') },
        { mode: "xquery", load: async () => await import('../../../src/assert/codemirror/mode/xquery/xquery.js') },
        { mode: "yacas", load: async () => await import('../../../src/assert/codemirror/mode/yacas/yacas.js') },
        { mode: "yaml", load: async () => await import('../../../src/assert/codemirror/mode/yaml/yaml.js') },
        { mode: "yaml-frontmatter", load: async () => await import('../../../src/assert/codemirror/mode/yaml-frontmatter/yaml-frontmatter.js') },
        { mode: "z80", load: async () => await import('../../../src/assert/codemirror/mode/z80/z80.js') }]
}


export var CodeMirrorModes = [
    { label: "python", abled: true, mode: "python" },
    { label: "c#", abled: true, mode: "clike" },
    { label: "css", abled: true, mode: "css" },
    { label: "go", abled: true, mode: "go" },
    { label: "markdown", abled: true, mode: "markdown" },
    { label: "r", abled: true, mode: "r" },
    { label: "yaml", abled: true, mode: "yaml" },
    { label: "xml", abled: true, mode: "xml" },
    { label: "dart", abled: true, mode: "dart" },
    { label: "javascript", abled: true, mode: "javascript" },
    { label: "rust", abled: true, mode: "rust" },
    { label: "vue", abled: true, mode: "vue" },
    { label: "lua", abled: true, mode: "lua" },
    { label: "jsx", abled: true, mode: "jsx" },
    { label: "swift", abled: true, mode: "swift" },
    { label: "sql", abled: true, mode: "sql" },
    { label: "php", abled: true, mode: "php" },
    { label: "protobuf", abled: true, mode: "protobuf" },
    { label: "nginx", abled: true, mode: "nginx" },
    { label: "shell", abled: true, mode: "shell" },
    { label: "mbox", abled: true, mode: "mbox" },
    { label: "htmlmixed", mode: "htmlmixed" },


    { label: "apl", mode: "apl" },
    { label: "asciiarmor", mode: "asciiarmor" },
    { label: "asn.1", mode: "asn.1" },
    { label: "asterisk", mode: "asterisk" },
    { label: "brainfuck", mode: "brainfuck" },

    { label: "clojure", abled: true, mode: "clojure" },
    { label: "cmake", abled: true, mode: "cmake" },
    { label: "cobol", mode: "cobol" },
    { label: "coffeescript", abled: true, mode: "coffeescript" },
    { label: "commonlisp", mode: "commonlisp" },
    { label: "crystal", mode: "crystal" },
    { label: "cypher", mode: "cypher" },
    { label: "d", mode: "d" },

    { label: "diff", mode: "diff" },
    { label: "django", abled: true, mode: "django" },
    { label: "dockerfile", abled: true, mode: "dockerfile" },
    { label: "dtd", mode: "dtd" },
    { label: "dylan", mode: "dylan" },
    { label: "ebnf", mode: "ebnf" },
    { label: "ecl", mode: "ecl" },
    { label: "eiffel", mode: "eiffel" },
    { label: "elm", mode: "elm" },
    { label: "erlang", abled: true, mode: "erlang" },
    { label: "factor", mode: "factor" },
    { label: "fcl", mode: "fcl" },
    { label: "forth", mode: "forth" },
    { label: "fortran", mode: "fortran" },
    { label: "gas", mode: "gas" },
    { label: "gfm", mode: "gfm" },
    { label: "gherkin", mode: "gherkin" },


    { label: "groovy", mode: "groovy" },
    { label: "haml", abled: true, mode: "haml" },
    { label: "handlebars", mode: "handlebars" },
    { label: "haskell", abled: true, mode: "haskell" },
    { label: "haskell-literate", abled: true, mode: "haskell-literate" },
    { label: "haxe", abled: true, mode: "haxe" },
    { label: "htmlembedded", mode: "htmlembedded" },

    { label: "http", abled: true, mode: "http" },
    { label: "idl", mode: "idl" },

    { label: "jinja2", mode: "jinja2" },

    { label: "julia", mode: "julia" },
    { label: "livescript", mode: "livescript" },


    { label: "mathematica", mode: "mathematica" },

    { label: "meta.js", mode: "meta.js" },
    { label: "mirc", mode: "mirc" }, { label: "mllike", mode: "mllike" },
    { label: "modelica", mode: "modelica" },
    { label: "mscgen", mode: "mscgen" },
    { label: "mumps", mode: "mumps" },

    { label: "nsis", abled: true, mode: "nsis" },
    { label: "ntriples", mode: "ntriples" },
    { label: "octave", mode: "octave" },
    { label: "oz", mode: "oz" },
    { label: "pascal", mode: "pascal" },
    { label: "pegjs", mode: "pegjs" },
    { label: "perl", abled: true, mode: "perl" },

    { label: "pig", mode: "pig" },
    { label: "powershell", abled: true, mode: "powershell" },
    { label: "properties", mode: "properties" },

    { label: "pug", mode: "pug" },
    { label: "puppet", mode: "puppet" },

    { label: "q", mode: "q" },

    { label: "rpm", mode: "rpm" },
    { label: "rst", mode: "rst" },
    { label: "ruby", mode: "ruby" },

    { label: "sas", mode: "sas" },
    { label: "sass", abled: true, mode: "sass" },
    { label: "scheme", abled: true, mode: "scheme" },

    { label: "sieve", mode: "sieve" },
    { label: "slim", mode: "slim" },
    { label: "smalltalk", mode: "smalltalk" },
    { label: "smarty", mode: "smarty" },
    { label: "solr", mode: "solr" },
    { label: "soy", mode: "soy" },
    { label: "sparql", mode: "sparql" },
    { label: "spreadsheet", mode: "spreadsheet" },

    { label: "stex", mode: "stex" },
    { label: "stylus", abled: true, mode: "stylus" },

    { label: "tcl", mode: "tcl" },
    { label: "textile", mode: "textile" },
    { label: "tiddlywiki", mode: "tiddlywiki" },
    { label: "tiki", mode: "tiki" },
    { label: "toml", mode: "toml" },
    { label: "tornado", mode: "tornado" },
    { label: "troff", mode: "troff" },
    { label: "ttcn", mode: "ttcn" },
    { label: "ttcn-cfg", mode: "ttcn-cfg" },
    { label: "turtle", mode: "turtle" },
    { label: "twig", mode: "twig" },
    { label: "vb", abled: true, mode: "vb" },
    { label: "vbscript", abled: true, mode: "vbscript" },
    { label: "velocity", mode: "velocity" },
    { label: "verilog", mode: "verilog" },
    { label: "vhdl", mode: "vhdl" },

    { label: "wast", mode: "wast" },
    { label: "webidl", mode: "webidl" },

    { label: "xquery", mode: "xquery" },
    { label: "yacas", mode: "yacas" },

    { label: "yaml-frontmatter", mode: "yaml-frontmatter" },
    { label: "z80", mode: "z80" }]

