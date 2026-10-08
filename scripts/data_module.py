"""Shared footer for data/*.js module files.

Every non-vocab data file ends by registering its payload under
DIM_DATA.<module>.<code>; consumers read it through
LangLoader.data(lang, module) (lib/lang-loader.js), so adding a language
needs no per-language branches in the feature code.  The top-level
const/var name stays for the Node validators that load the file in a vm.
"""


def register_footer(module, code, name):
    return (
        '\n// 统一注册：消费方经 LangLoader.data(lang, module) 取数（lib/lang-loader.js）\n'
        '(globalThis.DIM_DATA = globalThis.DIM_DATA || {});\n'
        '(globalThis.DIM_DATA.%s = globalThis.DIM_DATA.%s || {}).%s = %s;\n'
        % (module, module, code, name)
    )
