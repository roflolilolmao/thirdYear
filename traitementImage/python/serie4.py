import cv2
import numpy


__author__ = 'Quentin'

def ex1():
    image = cv2.imread('./images/serie4/lenaX.png')
    cv2.imshow('image base', image)
    gry = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imshow('image gry', gry)
    result = cv2.bitwise_and(gry, 0x1)
    result = cv2.normalize(result, result, 0, 255, cv2.NORM_MINMAX)
    cv2.imshow('lol', result)
    cv2.waitKey(0)


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
    cv2.waitKey(0)


def ex3():
    ref = cv2.imread('./images/serie4/BackgroudSubtraction/image_ref.bmp')
    for i in range(10, 25):
        name = './images/serie4/BackgroudSubtraction/image_' + str(i) + '.bmp'
        image = cv2.imread(name)
        res = cv2.subtract(image, ref)
        cv2.imshow(str(i), res)
    cv2.waitKey(0)


if __name__ == '__main__':
    ex3()