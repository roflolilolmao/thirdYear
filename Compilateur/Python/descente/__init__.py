from ply import lex
import sys

__author__ = 'Quentin'


def debug(f):
    debug.indent = ''

    def toto(*args):
        print("%-5s %s %s: %s" % (
            LATok.value if LATok else 'EOF', debug.indent, f.__name__, ",".join(args) if args else ''))
        debug.indent += ' | '
        result = f(*args)
        debug.indent = debug.indent[:-3]
        if not result:
            print("%-5s %s **failure" % (LATok.value if LATok else 'EOF', debug.indent))
        return result

    return toto


tokens = (
    'identifier',
)

literals = '()+'

t_identifier = r'\w+'


def t_error(t):
    print("nope")


lex.lex()


def parse(s):
    global LATok
    print("** parsing: ", s)
    lex.input(s)
    LATok = lex.token()
    result = input()
    print("** result: ", result)


def error():
    print("salut")


def require(found):
    if found:
        return True
    error("Error parsing near token %s" % LATok.value)


@debug
def token(t):
    global LATok
    if not LATok:
        return t == 'EOF'
    if LATok.type != t:
        return False
    LATok = lex.token()
    return True


@debug
def input():
    return expression() and require(token('EOF'))


@debug
def expression():
    return term() and require(rest_expression())


@debug
def term():
    return token('identifier') or parenth_expr()


@debug
def parenth_expr():
    return token('(') and require(expression() and require(token(')')))


@debug
def rest_expression():
    return (token('+') and require(expression())) or True


if __name__ == '__main__':
    parse('12+3')
