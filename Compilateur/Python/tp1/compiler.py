import AST

__author__ = 'Quentin'

operations = {
    '+': lambda x, y: x+y,
    '-': lambda x, y: x-y,
    '*': lambda x, y: x*y,
    '/': lambda x, y: x/y
}

stack = []
vars = {}


def valueOfToken(t):
    if isinstance(t, str):
        try:
            return vars[t]
        except KeyError:
            print("*** Error: variable %s undefined!" % t)
    return t


def compile(node):
    compiled = ""
    while node:
        if node.__class__ in [AST.EntryNode, AST.ProgramNode]:
            pass
        elif node.__class__ == AST.TokenNode:
            if isinstance(node.tok, str):
                compiled += 'PUSHV %s\n' % node.tok
            else:
                compiled += 'PUSHC %s\n' % node.tok
            stack.append(node.tok)
        elif node.__class__ == AST.PrintNode:
            compiled += ''
            val = stack.pop()
            print(valueOfToken(val))
        elif node.__class__ == AST.OpNode:
            arg2 = valueOfToken(stack.pop())
            if node.nbargs == 2:
                arg1 = valueOfToken(stack.pop())
            else:
                arg1 = 0
            stack.append(operations[node.op](arg1, arg2))
        elif node.__class__ == AST.AssignNode:
            val = valueOfToken(stack.pop())
            name = stack.pop()
            vars[name] = val
        elif node.__class__ == AST.WhileNode:
            cond = valueOfToken(stack.pop())
            if cond:
                node = node.next[0]
            else:
                node = node.next[1]
            continue
        if node.next:
            node = node.next[0]
        else:
            node = None


if __name__ == '__main__':
    from parser5 import parse
    from threader import thread
    import sys
    import os
    prog = open(sys.argv[1]).read()
    ast = parse(prog)
    entry = thread(ast)
    compiled = compile(entry)
    name = os.path.splitext(sys.argv[1])[0] + '.vm'
    outfile = open(name, 'w')
    outfile.write(compiled)
    outfile.close()
    print("Wrote output to", name)
