import sys
import cv2
import numpy as np
import urllib2
import struct
import binascii
import requests


def getc(s):
    url = 'http://www.pythonchallenge.com/pc/' + s
    print('fetching {}'.format(url))
    r = requests.get(url, auth=('huge', 'file'))
    return r.content


def fouslamerde(h):
    split = np.array_split(h, h.shape[0])
    print(len(split))

    for i in range(0, len(split) / 2, 2):
        j = len(split) / 2 + i + 1
        split[i], split[j] = split[j], split[i]
    new = np.concatenate(split)
    return new


def e11():
    img = cv2.imread('cave.jpg')

    print(img.shape[0])
    print(img.shape[1])

    new2 = fouslamerde(img)
    new = np.swapaxes(new2, 0, 1)
    new = fouslamerde(new)
    new = np.swapaxes(new, 0, 1)

    cv2.imshow('dingue', img)
    cv2.imshow('ew', new)
    cv2.imshow('e2w', new2)
    cv2.waitKey()


def e12fuck(fil, n):
    with open(fil, 'rb') as f:
        t = f.read()
        value = [struct.unpack('B', t[i])[0] for i in range(len(t))]
        l = [''.join([chr(x) for x in value[i:len(value):n]]) for i in range(n)]
        for i in range(n):
            with open('e{}.png'.format(i), 'wb') as fuck:
                fuck.write(l[i])


def e12():
    t = getc('return/evil2.gfx')
    e12fuck('evil2.gfx', 5)


def e13():
    bert = '22337778'
    evil = '33888444555'
    p = getc('return/evil4.jpg')
    print(p)


e13()