__author__ = 'Quentin Jeanmonod'


M = '0000000100100011010001010110011110001001101010111100110111101111'
IP = [
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7,
    56, 48, 40, 32, 24, 16, 8, 0,
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6
]


def inverseVector(vector):
    i = 0
    vector_I = []
    while i < len(vector):
        vector_I.append(vector.index(i))
        i += 1
    return vector_I


def permutation(message, vector):
    assert(len(message) == len(vector))
    i = 0
    Mp = []
    strMp = ''
    while i < len(message):
        strMp += message[vector[i]]
        i += 1
    return strMp


if __name__ == '__main__':
    strMp = permutation(M, IP)
    print('Message\n', M)
    print('Cyphered message\n', strMp)
    IP_I = inverseVector(IP)
    strMtest = permutation(strMp, IP_I)
    print('Decyphered message\n', strMtest)
