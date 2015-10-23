__author__ = 'Quentin'

P = [1, 2, 2, 2]
k = [1, 2, 3, 6]

s = list(range(0, 8))
j = 0
for i in range(0, 8):
    j = (j + s[i] + k[i % 4]) % 8
    s[i], s[j] = s[j], s[i]

i = j = 0
Pp = []
for p in P:
    i = (i + 1) % 8
    j = (j + s[i]) % 8
    s[i], s[j] = s[j], s[i]
    t = (s[i] + s[j]) % 8
    Pp.append(p ^ s[t])

print(Pp)

# TODO 3.2 aussi