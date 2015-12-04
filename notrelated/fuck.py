import sys
import cv2
import numpy as np
import urllib
import struct
import binascii
def getc(s):
    return urllib.urlopen('http://www.pythonchallenge.com/pc/' + s).read()
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
def e12():
    # t = getc('return/evil2.gfx')
    with open('evil2.gfx', 'rb') as f:
        t = f.read()
        value = [struct.unpack('B', t[i])[0] for i in range(len(t))]
        l = [''.join([chr(x) for x in value[i:len(value):5]]) for i in range(5)]
        for i in range(5):
            with open('e{}.png'.format(i), 'wb') as fuck:
                fuck.write(l[i])
        
        
e12()