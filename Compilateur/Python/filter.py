# -*- coding: utf-8 -*-
import sys
import re

if __name__ == "__main__":
    try:
        # filte = sys.argv[1]
        filte = "\d+.\d+"
        file = open(sys.argv[2], 'r')
    except Exception:
        print("something's wrong")
        sys.exit(2)
    if filte:
        liste = []
        for i in file:
            p = re.compile(filte)
            m = p.findall(i)
            if m:
                liste.append(m)
        for i in liste:
            print(i)
    else:
        print(file.read())
    file.close()