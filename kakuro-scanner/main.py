import cv2
import numpy as np
from matplotlib import pyplot as plt
import math
import pytesseract
from pytesseract import Output


img_rgb = cv2.imread('img.jpg')


mask = np.zeros(img_rgb.shape[:2], np.uint8)


def findTemplate(img, s):
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    template = cv2.imread(s, 0)
    w, h = template.shape[::-1]
    res = cv2.matchTemplate(img_gray, template, cv2.TM_CCOEFF_NORMED)
    threshold = 0.9
    loc = np.where(res >= threshold)
    return (loc, (w, h))


arr = []

for s in ["corner1.jpg", "corner2.jpg", "corner3.jpg", "corner4.jpg", "empty1.jpg", "empty2.jpg", "empty3.jpg", "empty4.jpg"]:
    loc, size = findTemplate(img_rgb, s)
    h, w = size
    cnt = 0
    for pt in zip(*loc[::-1]):
        if mask[pt[1] + h//2, pt[0] + w//2] != 255:
            cnt += 1
            mask[pt[1]: pt[1] + h, pt[0]: pt[0] + w] = 255

            cv2.rectangle(img_rgb, pt,
                          (pt[0] + 10, pt[1] + 10),
                          (0, 0, 255), 2)

            arr.append([pt[0] + h//2, pt[1] + w//2])

mxPts = []
mxArea = 0


def shoelace(x_y):
    x_y = np.array(x_y)
    x_y = x_y.reshape(-1, 2)

    x = x_y[:, 0]
    y = x_y[:, 1]

    S1 = np.sum(x*np.roll(y, -1))
    S2 = np.sum(y*np.roll(x, -1))

    area = .5*np.absolute(S1 - S2)

    return area


def order_points(pts):
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect


for i in range(len(arr)):
    for j in range(i+1, len(arr)):
        for k in range(j+1, len(arr)):
            for l in range(k+1, len(arr)):
                pt1 = arr[i]
                pt2 = arr[j]
                pt3 = arr[k]
                pt4 = arr[l]

                area = shoelace(order_points(np.array([pt1, pt2, pt3, pt4])))

                if area > mxArea:
                    mxArea = area
                    mxPts = [pt1, pt2, pt3, pt4]

for pt in mxPts:
    cv2.rectangle(img_rgb, (pt[0], pt[1]),
                  (pt[0] + 10, pt[1] + 10),
                  (0, 255, 0), 2)


def four_point_transform(image, pts):
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))

    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))

    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

    return warped


warpedImg = four_point_transform(img_rgb, np.float32(mxPts))

newArr = []
mask = np.zeros(warpedImg.shape[:2], np.uint8)

loc, size = findTemplate(warpedImg, "main.jpg")
h, w = size

for pt in zip(*loc[::-1]):
    if mask[pt[1] + h//2, pt[0] + w//2] != 255:
        cnt += 1
        mask[pt[1]: pt[1] + h, pt[0]: pt[0] + w] = 255
        newArr.append([pt[0] + h//2, pt[1] + w//2])

for pt in newArr:
    cv2.rectangle(warpedImg, tuple(pt),
                  (pt[0] + 10, pt[1] + 10),
                  (255, 0, 0), 2)

sortedX = sorted([x[0] for x in newArr])
sortedY = sorted([x[1] for x in newArr])

print(sortedX, sortedY)

w, h = warpedImg.shape[:2]

cv2.imwrite("dewarped.jpg", warpedImg)

mnX = 1e9
for i in range(len(sortedX) - 1):
    if sortedX[i + 1] - sortedX[i] < 40:
        continue
    mnX = min(mnX, sortedX[i + 1] - sortedX[i])

mnY = 1e9
for i in range(len(sortedY) - 1):
    if sortedY[i + 1] - sortedY[i] < 40:
        continue
    mnY = min(mnY, sortedY[i + 1] - sortedY[i])

m, n = int((w + 0.5) // mnX), int((h + 0.5) // mnY)

print(m, n)

for y in range(n):
    for x in range(m):
        xx = x * (w // m)
        dx = (w // m)

        yy = y * (h // n)
        dy = (h // n)

        square = warpedImg[xx: xx + dx, yy: yy + dy]

        gray = cv2.cvtColor(square, cv2.COLOR_BGR2GRAY)

        gray = cv2.threshold(gray, 0, 255,
                             cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

        gray = cv2.medianBlur(gray, 3)

        text1 = pytesseract.image_to_string(
            gray[0:dy//2], config='--psm 10 -c tessedit_char_whitelist=123456789')

        text2 = pytesseract.image_to_string(
            gray[dy//2:dy], config='--psm 10 -c tessedit_char_whitelist=123456789')

        cv2.imwrite("cropped/res"+str(text1)+".png", gray[0:dy//2, dx//2:dx])
        cv2.imwrite("cropped/res"+str(text2)+".png", gray[dy//2:dy, 0:dx//2])

        print(x, y)
        print(text1, text2)
