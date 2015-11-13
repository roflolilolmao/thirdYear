import ply.lex as lex


__author__ = 'Quentin'

reserved_words = (
    'while',
    'print'
)

tokens = (
    'NUMBER',
    'ADD_OP', 'MUL_OP',
    'PAR_OPEN', 'PAR_CLOSE',
    'BRA_OPEN', 'BRA_CLOSE',
    'SEMICOLON',
    'IDENTIFIER',
    'EQUAL'
) + tuple(map(lambda s: s.upper(), reserved_words))
t_ADD_OP = r'\+|-'
t_MUL_OP = r'\*|\/'
t_PAR_OPEN = r'\('
t_PAR_CLOSE = r'\)'
t_BRA_OPEN = r'\{'
t_BRA_CLOSE = r'\}'
t_SEMICOLON = r';'
t_EQUAL = r'='


def t_IDENTIFIER(t):
    r'[A-Za-z_]\w*'
    if t.value in reserved_words:
        t.type = t.value.upper()
    return t


def t_NUMBER(t):
    r'\d*\.?\d+'
    try:
        t.value = int(t.value)
    except ValueError:
        t.value = float(t.value)
    return t


def t_newline(t):
    r'\n'
    t.lexer.lineno += len(t.value)


t_ignore = ' \t'


def t_error(t):
    print("lex: Illegal character '%s'" % t.value[0])
    t.lexer.skip(1)


lex.lex()


if __name__ == '__main__':
    import sys
    prog = open(sys.argv[1]).read()

    lex.input(prog)
    while (1):
        tok = lex.token()
        if not tok:
            break
        print("line %d: %s(%s)" % (tok.lineno, tok.type, tok.value))
