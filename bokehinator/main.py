import cv2
import numpy as np
import math

img = cv2.imread("./img.jpg")

blurSize = (101, 101)
blurPower = 4

outOfFocus = (31, 31)


def showWindow(img):
    size = 1000
    img = cv2.resize(
        img, (size, size * img.shape[0] // img.shape[1]), interpolation=cv2.INTER_CUBIC
    )
    cv2.imshow("lol", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def extractFocus(img):
    bw = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    bw = cv2.GaussianBlur(bw, (3, 3), 0)

    lap = cv2.Laplacian(bw, cv2.CV_16S)
    lap = cv2.convertScaleAbs(lap)

    foc = cv2.GaussianBlur(lap, blurSize, 0)

    norm = np.zeros(lap.shape)
    norm = cv2.normalize(foc, norm, 0, 255, cv2.NORM_MINMAX)

    cv2.dilate(norm, (3, 3), iterations=2)

    return cv2.cvtColor(norm, cv2.COLOR_GRAY2RGB)


def blur(img):
    kernel = np.zeros(outOfFocus, np.float)
    cnt = 0
    for x in range(outOfFocus[1]):
        for y in range(outOfFocus[0]):
            if (
                math.hypot(outOfFocus[0] / 2 - x, outOfFocus[1] / 2 - y)
                < outOfFocus[1] / 2
            ):
                kernel[x][y] = 1
                cnt += 1
    kernel /= cnt

    return cv2.filter2D(img, -1, kernel)


def bokeh(img):
    arr = np.divide(img.copy(), 255)

    arr = np.power(arr, blurPower)
    arr = blur(arr)
    arr = np.power(arr, 1 / blurPower)

    arr = np.multiply(arr, 255).astype(np.uint8)

    blured = blur(img)

    blured = np.maximum(blured, arr)

    return blured


focus = extractFocus(img) / 255

cv2.imwrite("focus.jpg", focus * 255)

blured = 1.0 - focus

cv2.imwrite("bokeh.jpg", img * focus + bokeh(img) * blured)
