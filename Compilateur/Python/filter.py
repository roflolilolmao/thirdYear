# -*- coding: utf-8 -*-
import sys,re

if __name__ == "__main__":
    try:
        filte = sys.argv[1]
        file = open(sys.argv[2], "r")
    except Exception:
        print("something's wrong")
        sys.exit(2)
    if filte:
        liste = []
        for i in file:
            p = re.compile(filte)
            m = p.match(i)
            if m:
                liste.append(i)
        print(liste)
    else:
        print(file.read())
    file.close()