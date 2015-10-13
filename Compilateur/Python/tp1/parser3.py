import ply.yacc as yacc
from tp1.lex3 import *
import pydot
from tp1.AST import *


__author__ = 'Quentin'


var = dict()


def p_program_statement(p):
    '''program : statement
    | statement SEMICOLON program'''
    if len(p) > 2:
        p[0] = ProgramNode([p[1]]+p[3].children)
    else:
        p[0] = ProgramNode(p[1])


def p_statement_exp(p):
    '''statement : expression
    | assignement'''
    p[0] = p[1]


def p_assignement(p):
    'assignement : IDENTIFIER EQUAL expression'
    p[0] = AssignNode([TokenNode(p[1]), p[3]])


def p_expression_par(p):
    'expression : PAR_OPEN expression PAR_CLOSE'
    p[0] = p[2]


def p_expression_num(p):
    '''expression : NUMBER
    | IDENTIFIER'''
    p[0] = TokenNode(p[1])


def p_expression_unary_num(p):
    'expression : ADD_OP NUMBER'
    if p[1] == '-':
        i = -1
    else:
        i = 1
    p[0] = TokenNode(i * p[2])


operations = {
    '+': lambda x, y: x+y,
    '-': lambda x, y: x-y,
    '*': lambda x, y: x*y,
    '/': lambda x, y: x/y
}


def p_expression_op(p):
    '''expression : expression ADD_OP expression
    | expression MUL_OP expression'''
    p[0] = OpNode(p[2], [p[1], p[3]])


def p_error(p):
    print("parser1: Syntax error in line %d" % p.lineno)
    yacc.yacc().errok()


precedence = (
    ('left', 'ADD_OP'),
    ('left', 'MUL_OP'),
    ('left', 'PAR_OPEN'),
    ('right', 'PAR_CLOSE')
)


yacc.yacc()


if __name__ == '__main__':
    import sys
    prog = open(sys.argv[1]).read()
    result = yacc.parse(prog)
    print(result)
    import os
    graph = result.makegraphicaltree()
    name = os.path.splitext(sys.argv[1])[0]+'-ast.pdf'
    graph.write_pdf(name)
    print("wrote ast to ", name)
