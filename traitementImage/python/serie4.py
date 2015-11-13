import cv2

import numpy as np


__author__ = 'Quentin'

def ex1():
    image = cv2.imread('./images/serie4/lenaX.png')
    cv2.imshow('image base', image)
    gry = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imshow('image gry', gry)
    result = cv2.bitwise_and(gry, 0x1)
    result = cv2.normalize(result, result, 0, 255, cv2.NORM_MINMAX)
    cv2.imshow('lol', result)


def ex2():
    image = cv2.imread('./images/serie4/lenaX.png')
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = 0x1
    for i in range(0, 9):
        res = cv2.bitwise_and(image, mask)
        res = cv2.normalize(res, res, 0, 255, cv2.NORM_MINMAX)
        cv2.imshow(str(mask), res)
        mask2 = mask
        mask2 <<= 1
        mask += mask2


def ex3():
    ref = cv2.imread('./images/serie4/BackgroudSubtraction/image_ref.bmp')
    for i in range(10, 25):
        name = './images/serie4/BackgroudSubtraction/image_' + str(i) + '.bmp'
        image = cv2.imread(name)
        res = cv2.subtract(image, ref)
        cv2.imshow(str(i), res)


def ex3_serie4e():
    image = cv2.imread('./images/serie4/UneBalleBleue.jpg')
    blue = image[:,:,1]
    wat, thresh = cv2.threshold(blue, 0, 255, cv2.THRESH_BINARY_INV)

    kernel = np.ones((7, 7), np.uint8)
    dilate = cv2.dilate(thresh, kernel, iterations=1)
    erosion = cv2.erode(dilate, kernel, iterations=1)
    mask = erosion
    res = cv2.bitwise_and(image, image, mask)
    cv2.imshow('base', image)
    cv2.imshow('blue', blue)
    cv2.imshow('thresh', thresh)
    cv2.imshow('dilate', dilate)
    cv2.imshow('erosion', erosion)
    cv2.imshow('mask', mask)


if __name__ == '__main__':
    ex3_serie4e()
    cv2.waitKey(0)
