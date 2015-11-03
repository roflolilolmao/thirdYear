import AST
from AST import addToClass


@addToClass(AST.Node)
def thread(self, lastNode):
    for c in self.children:
        lastNode = c.thread(lastNode)
    lastNode.addNext(self)
    return self


@addToClass(AST.WhileNode)
def thread(self, lastNode):
    before = lastNode
    condition = self.children[0].thread(lastNode)
    condition.addNext(self)
    program = self.children[1].thread(self)
    program.addNext(before.next[-1])
    return self


def thread(tree):
    entry = AST.EntryNode()
    tree.thread(entry)
    return entry


if __name__ == "__main__":
    from parser5 import parse
    import sys
    import os
    prog = open(sys.argv[1]).read()
    ast = parse(prog)
    entry = thread(ast)

    graph = ast.makegraphicaltree()
    entry.threadTree(graph)

    name = os.path.splitext(sys.argv[1])[0] + '-ast-threaded.pdf'
    graph.write_pdf(name)
    print("wrote threaded ast to", name)