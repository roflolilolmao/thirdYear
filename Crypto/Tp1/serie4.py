__author__ = 'Quentin'


def gcd(a, b):
    while b > 0:
        a, b = b, a % b
    return a


if __name__ == '__main__':
    a = gcd(542284229916, 231414210846)
    b = gcd(6289078768087500, 223092870)
    c = gcd(86822723, 7436429)
    print(a)
    print(b)
    print(c)
