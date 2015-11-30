__author__ = 'Quentin'

# Utils

a = [542284229916, 231414210846]
b = [6289078768087500, 223092870]
c = [86822723, 7436429]


def printNumbers(**kwargs):
    s = 'For numbers '
    for key in kwargs:
        s += '{} = {}, '.format(key, kwargs[key])
    print(s[:-2])


# Exercise 4.1

def gcd(n, m):
    while m > 0:
        n, m = m, n % m
    return n


def gcdPrint(n, m):
    printNumbers(a=n, b=m)
    print('GCD = {}'.format(gcd(n, m)))


def ex4_1():
    print('- Exercise 4.1 -')
    gcdPrint(a[0], a[1])
    gcdPrint(b[0], b[1])
    gcdPrint(c[0], c[1])


# Exercise 4.2

def extendedGCD(n, m):
    r = [n, m]
    s = [1, 0]
    t = [0, 1]
    while r[1] != 0:
        q = r[0] // r[1]
        r = [r[1], r[0] - q * r[1]]
        s = [s[1], s[0] - q * s[1]]
        t = [t[1], t[0] - q * t[1]]
    return s[0], t[0], r[0]


def inverse(n, m):
    t = [0, 1]
    r = [m, n % m]
    while r[1] != 0:
        q = r[0] // r[1]
        t = [t[1], t[0] - q * t[1]]
        r = [r[1], r[0] - q * r[1]]
    if r[0] > 1:
        raise ValueError('a and b aren\'coprime')
    return (t[0] + m) % m


def bezoutPrint(n, m):
    printNumbers(a=a[0], b=a[1])
    u, v, r = extendedGCD(n, m)
    print('Bezout coeffs are: u = {}, v = {}\nGCD = {}'.format(u, v, r))


def inversePrint(n, m):
    printNumbers(a=n, b=m)
    try:
        print('Inverse is {}'.format(inverse(n, m)))
    except ValueError:
        print('a and b aren\'t coprime')


def ex4_2():
    print('\n- Exercise 4.2 -')
    print('\t- a) -')
    bezoutPrint(a[0], a[1])
    bezoutPrint(b[0], b[1])
    bezoutPrint(c[0], c[1])
    print('\t- b) -')
    inversePrint(57, 10)
    inversePrint(57, 20)
    inversePrint(57, 30)
    inversePrint(57, 47)
    inversePrint(542284229916, 231414210847)
    inversePrint(1234567, 19394489)
    inversePrint(15485863, 22801763478)


# Exercise 4.3

def firstMethod(x, e, n):
    y = 1
    for i in range(0, e):
        y = (x * y) % n
    return y


def secondMethod(x, e, n):
    y = 1
    x = x % n
    while e > 0:
        if e % 2 == 1:
            y = (y * x) % n
        e >>= 1
        x = (x * x) % n
    return y


def printEx4_3(x, e, n):
    printNumbers(a=x, e=e, n=n)
    print('First method; result = {}'.format(firstMethod(x, e, n)))
    print('Second method; result = {}'.format(secondMethod(x, e, n)))


def ex4_3():
    print('\n- Exerise 4.3 -')
    for e in range(10000, 10011):
        printEx4_3(5317, e, 2119)
    printEx4_3(987654321, 123456789, 2038074743)
    import time
    printNumbers(a=987654321, e=1234567890000000000, n=2038074743)
    beginFirst = time.clock()
    # first = firstMethod(987654321, 1234567890000000000, 2038074743)
    stopFirst = time.clock()
    second = secondMethod(987654321, 1234567890000000000, 2038074743)
    stopSecond = time.clock()
    print('Results are {} for first method and {} for second method'.format('na', second))
    print('Times are {} for first method and {} for second method'.format('too long for my patience', stopSecond - stopFirst))


# Main

if __name__ == '__main__':
    # ex4_1()
    # ex4_2()
    # ex4_3()
    print(inverse(160, 353))
    print(139 * 52 % 353)
