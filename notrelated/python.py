s = [1]
print(0, len(s))
for k in range(31):
    a = s[0]
    c = 0
    t = []
    for i in s:
        if i == a:
            c += 1
        else:
            t[len(t):] = [c,a]
            a = i
            c = 0
    t[len(t):] = [c,a]
    s = t
    print(k + 1, len(s), ''.join(str(s))[:20])
    