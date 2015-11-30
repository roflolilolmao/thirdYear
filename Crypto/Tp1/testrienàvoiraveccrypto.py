__author__ = 'Quentin'

path1 = 'c:/test1.txt'
path2 = 'c:/test2.txt'
words = []
w = []
with open(path1) as file1:
    words = [[j for j in i] for i in file1]

with open(path2) as file2:
    for i in file2:
        for j in i:
            if words.index(j) > 0:
                w[len(w):] = [j]

print(w)