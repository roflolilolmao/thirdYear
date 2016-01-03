import math

__author__ = 'Quentin'


def parseFiles(fconn, fpos):
    cities = {l.split()[0]: (int(l.split()[1]), int(l.split()[2])) for l in fpos}
    links = [l.split() for l in fconn]
    return cities, links


def constructPath(path, current):
    t = [current]
    while current in path:
        current = path[current]
        t[len(t):] = [current]
    return t[::-1]


def astar(c, l, start, end, hfunction):
    closed = []
    ope = [start]
    path = {}
    score = {start: (hfunction(c[start], c[end]), 0)}
    while ope:
        current = min(ope, key=score.get)
        if current == end:
            return constructPath(path, end)
        ope.remove(current)
        closed.append(current)
        neigh = {i[1]: int(i[2]) for i in l if i[0] == current}
        neigh.update({i[0]: int(i[2]) for i in l if i[1] == current})
        for key, value in neigh.items():
            if key in closed:
                continue
            g = value + score[current][1]
            if key not in ope:
                ope.append(key)
            elif g >= score[key][1]:
                continue
            path[key] = current
            score[key] = (g + hfunction(c[key], c[end]), g)
    return None


def manhattan(a, b):
    return dist_x(a, b) + dist_y(a, b)


def euclid(a, b):
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)


def dijkstra(a, b):
    return 0


def dist_x(a, b):
    return math.fabs(a[0] - b[0])


def dist_y(a, b):
    return math.fabs(a[1] - b[1])


def printpath(path, links, i):
    print('From {} to {}, with heuristic {}'.format(path[0], path[len(path) - 1], i.__name__))
    dist = 0
    print('{} : 0 km'.format(path[0]))
    for n in range(1, len(path)):
        wer = [x for x in links if (x[0] == path[n] or x[1] == path[n]) and
               (x[0] == path[n - 1] or x[1] == path[n - 1])][0][2]
        dist += int(wer)
        print('{} : {} km'.format(path[n], dist))


def main():
    with open('connections.txt', 'r') as fconn:
        with open('positions.txt', 'r') as fpos:
            cities, links = parseFiles(fconn, fpos)
    h = [dijkstra, dist_x, dist_y, euclid, manhattan]
    # start, end = 'Warsaw', 'Lisbon'
    start, end = 'Brussels', 'Prague'
    for i in h:
        path = astar(cities, links, start, end, i)
        printpath(path, links, i)


if __name__ == '__main__':
    main()
