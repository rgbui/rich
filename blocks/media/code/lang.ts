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
        { mode: "z80", load: async () => await import('../../../src/assert/codemirror/mode/z80/z80.js') },
        {
            mode: 'text/html',
            load: async () => {
                await import('../../../src/assert/codemirror/mode/htmlmixed/htmlmixed.js');
                await import('../../../src/assert/codemirror/mode/xml/xml.js');
                await import('../../../src/assert/codemirror/mode/javascript/javascript.js');
                await import('../../../src/assert/codemirror/mode/css/css.js');
            }
        },
        {
            mode: 'text/x-less',
            load: async () => await import('../../../src/assert/codemirror/mode/css/css.js')
        },
        {
            mode: 'application/json',
            load: async () => await import('../../../src/assert/codemirror/mode/javascript/javascript.js')
        },
        {
            mode: 'application/ld+json',
            load: async () => await import('../../../src/assert/codemirror/mode/javascript/javascript.js')
        },
        {
            mode: 'application/manifest+json',
            load: async () => await import('../../../src/assert/codemirror/mode/javascript/javascript.js')
        },
        {
            mode: 'application/typescript',
            load: async () => await import('../../../src/assert/codemirror/mode/javascript/javascript.js')
        },
        {
            modes: ["text/x-csrc", "text/x-c++src", 'text/x-csharp', "text/x-objectivec", "text/x-scala", "text/x-kotlin"],
            load: async () => {
                await import('../../../src/assert/codemirror/mode/clike/clike.js');

            }
        },
        {
            modes: ['application/x-ejs', 'application/x-aspx', 'application/x-jsp'],
            load: async () => {
                await import('../../../src/assert/codemirror/mode/htmlmixed/htmlmixed.js');
            }
        },
        {
            modes: ['text/x-sql',
                'text/x-mariadb',
                'text/x-mssql',
                'text/x-plsql',
                'text/x-pgsql',
                'text/x-cassandra',
                'text/x-sqlite'
            ],
            load: async () => {
                await import('../../../src/assert/codemirror/mode/sql/sql.js');

            }
        }
    ]
}


export var CodeMirrorModes = [
    { label: 'HTML', abled: true, mode: 'text/html' },
    { label: "CSS", abled: true, mode: "css" },
    { label: 'TypeScript', words: ['ts'], abled: true, mode: 'text/typescript' },
    { label: "Vue", abled: true, mode: "vue" },
    { label: "React", abled: true, mode: "jsx" },
    { label: "JavaScript", words: ['js'], abled: true, mode: "javascript" },
    { label: "Python", abled: true, mode: "python" },
    { label: "Java", abled: true, mode: "text/x-java" },
    { label: "GO", abled: true, mode: "go" },
    { label: 'MySQL', abled: true, mode: 'text/x-sql' },
    { label: "PHP", abled: true, mode: "php" },
    { label: "Objective-C", abled: true, mode: "text/x-objectivec" },
    { label: "R", abled: true, mode: "r" },
    { label: "Json", abled: true, mode: 'application/json' },
    { label: "Yaml", abled: true, mode: "yaml" },
    { label: "Nginx", abled: true, mode: "nginx" },
    { label: "Shell", abled: true, mode: "shell" },
    { label: "C", abled: true, mode: "text/x-csrc" },
    { label: "C++", abled: true, mode: "text/x-c++src" },
    { label: 'C#', abled: true, mode: 'text/x-csharp' },
  
    { label: "Dart", abled: true, mode: "dart" },
    { label: "Scala", abled: true, mode: "text/x-scala" },
    { label: "Kotlin", abled: true, mode: "text/x-kotlin" },

   
  
    { label: "markdown", words: ['md'], abled: true, mode: "markdown" },
  
    // { label: "htmlmixed", mode: "htmlmixed" },
   
  
    { label: "XML", abled: true, mode: "xml" },
   
  
    { label: 'LESS', mode: 'text/x-less' },
    { label: 'SCSS', mode: 'text/x-scss' },
  
    { label: "Jsonld", able: true, mode: 'application/ld+json' },
    { label: 'Manifest', able: true, mode: 'application/manifest+json' },
  
    { label: "Rust", abled: true, mode: "rust" },
   
    { label: "Lua", abled: true, mode: "lua" },
    { label: "ejs", mode: 'application/x-ejs' },
    { label: "ASP.NET", mode: 'application/x-aspx' },
    { label: "JSP", mode: 'application/x-jsp' },
 
    { label: "Swift", abled: true, mode: "swift" },

 
    { label: 'MariaDB', abled: true, mode: 'text/x-mariadb' },
    { label: 'MSSQL', abled: true, mode: 'text/x-mssql' },
    { label: 'PLSQL', abled: true, mode: 'text/x-plsql' },
    { label: 'PgSQL', abled: true, mode: 'text/x-pgsql' },
    { label: 'Cassandra', abled: true, mode: 'text/x-cassandra' },
    { label: 'SQLite', abled: true, mode: 'text/x-sqlite' },


    // { label: "sql", abled: true, mode: "sql" },

    { label: "ProtoBuf", abled: true, mode: "protobuf" },
   
    { label: "mbox", abled: true, mode: "mbox" },
    { label: "Apl", mode: "apl" },
    // { label: "asciiarmor", mode: "asciiarmor" },
    { label: "ASN.1", mode: "asn.1" },
    { label: "Asterisk dialplan", mode: "asterisk" },
    { label: "Brainfuck", mode: "brainfuck" },

    { label: "Clojure", abled: true, mode: "clojure" },
    { label: "Cmake", abled: true, mode: "cmake" },
    { label: "COBOL", mode: "cobol" },
    { label: "Coffeescript", abled: true, mode: "coffeescript" },
    { label: "Common Lisp", mode: "commonlisp" },
    { label: "Crystal", mode: "crystal" },
    { label: "Cypher", mode: "cypher" },
    { label: "D", mode: "d" },

    { label: "diff", mode: "diff" },
    { label: "Django", abled: true, mode: "django" },
    { label: "Dockerfile", abled: true, mode: "dockerfile" },
    { label: "DTD", mode: "dtd" },
    { label: "Dylan", mode: "dylan" },
    { label: "EBNF", mode: "ebnf" },
    { label: "ECL", mode: "ecl" },
    { label: "Eiffel", mode: "eiffel" },
    { label: "Elm", mode: "elm" },
    { label: "Erlang", abled: true, mode: "erlang" },
    { label: "Factor", mode: "factor" },
    { label: "F#", mode: "fcl" },
    { label: "Forth", mode: "forth" },
    { label: "Fortran", mode: "fortran" },
    { label: "Gas", mode: "gas" },
    { label: "Gfm", mode: "gfm" },
    { label: "Gherkin", mode: "gherkin" },


    { label: "Groovy", mode: "groovy" },
    { label: "HAML", abled: true, mode: "haml" },
    { label: "Handlebars", mode: "handlebars" },
    { label: "Haskell", abled: true, mode: "haskell" },
    { label: "Haskell (Literate)", abled: true, mode: "haskell-literate" },
    { label: "Haxe", abled: true, mode: "haxe" },
    // { label: "htmlembedded", mode: "htmlembedded" },

    { label: "HTTP", abled: true, mode: "http" },
    { label: "IDL", mode: "idl" },

    { label: "Jinja2", mode: "jinja2" },

    { label: "Julia", mode: "julia" },
    { label: "LiveScript", mode: "livescript" },


    { label: "Mathematica", mode: "mathematica" },

    // { label: "meta.js", mode: "meta.js" },
    { label: "mIRC", mode: "mirc" }, { label: "mllike", mode: "mllike" },
    { label: "Modelica", mode: "modelica" },
    { label: "MscGen", mode: "mscgen" },
    { label: "MUMPS", mode: "mumps" },

    { label: "NSIS", abled: true, mode: "nsis" },
    { label: "N-Triples/N-Quads", mode: "ntriples" },
    { label: "Octave", mode: "octave" },
    { label: "Oz", mode: "oz" },
    { label: "Pascal", mode: "pascal" },
    { label: "PEG.js", mode: "pegjs" },
    { label: "Perl", abled: true, mode: "perl" },

    { label: "Pig", mode: "pig" },
    { label: "PowerShell", abled: true, mode: "powershell" },
    { label: "Properties files", mode: "properties" },

    { label: "Pug", mode: "pug" },
    { label: "Puppet", mode: "puppet" },

    { label: "Q", mode: "q" },

    { label: "RPM", mode: "rpm" },
    { label: "reStructuredText", mode: "rst" },
    { label: "Ruby", mode: "ruby" },

    { label: "SAS", mode: "sas" },
    { label: "SASS", abled: true, mode: "sass" },
    { label: "Scheme", abled: true, mode: "scheme" },

    { label: "Sieve", mode: "sieve" },
    { label: "Slim", mode: "slim" },
    { label: "Smalltalk", mode: "smalltalk" },
    { label: "Smarty", mode: "smarty" },
    { label: "Solr", mode: "solr" },
    { label: "Soy", mode: "soy" },
    { label: "Sparql", mode: "sparql" },
    { label: "Spreadsheet", mode: "spreadsheet" },

    { label: "sTeX, LaTeX", mode: "stex" },
    { label: "Stylus", abled: true, mode: "stylus" },

    { label: "Tcl", mode: "tcl" },
    { label: "Textile", mode: "textile" },
    { label: "Tiddlywiki", mode: "tiddlywiki" },
    { label: "Tiki", mode: "tiki" },
    { label: "TOML", mode: "toml" },
    { label: "Tornado (templating language)", mode: "tornado" },
    { label: "troff (for manpages)", mode: "troff" },
    { label: "TTCN", mode: "ttcn" },
    { label: "TTCN Configuration", mode: "ttcn-cfg" },
    { label: "Turtle", mode: "turtle" },
    { label: "Twig", mode: "twig" },
    { label: "Vb", abled: true, mode: "vb" },
    { label: "VbScript", abled: true, mode: "vbscript" },
    { label: "Velocity", mode: "velocity" },
    { label: "Verilog", mode: "verilog" },
    { label: "Vhdl", mode: "vhdl" },

    { label: "Wast", mode: "wast" },
    { label: "Webidl", mode: "webidl" },

    { label: "XQuery", mode: "xquery" },
    { label: "Yacas", mode: "yacas" },

    { label: "YAML frontmatter", mode: "yaml-frontmatter" },
    { label: "Z80", mode: "z80" }]




