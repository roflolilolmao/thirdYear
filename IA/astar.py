#!python3
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
        t[:0] = [current]
    return t


def astar(cities, links, start, end, hfunction):
    closed = []
    open_ = [start]
    path = {}
    score = {start: (hfunction(cities[start], cities[end]), 0)}
    i = 0
    while open_:
        i += 1
        current = min(open_, key=score.get)
        if current == end:
            # print(i)
            return constructPath(path, end)
        open_.remove(current)
        closed.append(current)
        neigh = {i[1]: int(i[2]) for i in links if i[0] == current}
        neigh.update({i[0]: int(i[2]) for i in links if i[1] == current})
        for city, distance_to in neigh.items():
            if city in closed:
                continue
            distance_from_start = distance_to + score[current][1]
            if city not in open_:
                open_.append(city)
            elif distance_from_start >= score[city][1]:
                continue
            path[city] = current
            score[city] = (distance_from_start + hfunction(cities[city], cities[end]), distance_from_start)
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
    print('From {} to {}, with heuristic {}, visited {} cities'.format(path[0], path[len(path) - 1], i.__name__, len(path)))
    print('{} : 0 km'.format(path[0]))
    dist = 0
    for n in range(len(path) - 1):
        wer = [x for x in links if (x[0] == path[n] or x[1] == path[n]) and
               (x[0] == path[n + 1] or x[1] == path[n + 1])]
        dist += int(wer[0][2])
        print('{} : {} km'.format(path[n + 1], dist))


def findUnadmissiblePaths(cities, links, h):
    for i in cities.keys():
        for j in cities.keys():
            if i != j:
                unadmissible = False
                paths = {k: astar(cities, links, i, j, k) for k in h}
                for k, p in paths.items():
                    for l, q in paths.items():
                        if k != l and len(p) != len(q):
                            unadmissible = True
                if unadmissible:
                    print('From {} to {}, an unadmissible path has been found'.format(i, j))
                    for o, k in paths.items():
                        printpath(k, links, o)


def main():
    with open('connections.txt', 'r') as fconn:
        with open('positions.txt', 'r') as fpos:
            cities, links = parseFiles(fconn, fpos)
    h = [dijkstra, dist_x, dist_y, euclid, manhattan]
    # astar(cities, links, 'Berlin', 'Lisbon', dijkstra)
    findUnadmissiblePaths(cities, links, h)


if __name__ == '__main__':
    main()
