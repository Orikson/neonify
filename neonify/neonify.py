"""
    Author: Eron Ristich
    Date: 9/26/21
    File: ./neonify/neonify.py
    Description: Neonify the image via image processing
"""

from PIL import Image


def neon(file):
    image = Image.open(file)
    pixel = image.load()

    # works on black and white images only
    # new method finds non black pixels and then modifies the pixels around it



    # remove antialiasing
    for i in range(image.size[0]):
        for j in range(image.size[1]):
            if pixel[i,j] != (0,0,0,255):
                image.putpixel((i,j), (255, 255, 255, 255))
            else:
                image.putpixel((i,j), (0,0,0,0))

    # n defines the distance from white pixels that will be filled
    n = 30

    # generate alpha values of length n
    gen = [255]
    for i in range(n):
        gen.append(pow(2,-(i/6-7.9)))

    # pixels that were modified
    lastgen = []

    # first step we find all the white pixels
    for i in range(image.size[0]):
        for j in range(image.size[1]):
            if pixel[i,j] == (255, 255, 255, 255):
                if pixel[i,j+1] == (0, 0, 0, 0) and j+1 < image.size[1]:
                    image.putpixel((i,j+1), (255, 255, 255, int(gen[1])))
                    lastgen.append((i,j+1))
                if pixel[i+1,j] == (0, 0, 0, 0) and i+1 < image.size[0]:
                    image.putpixel((i+1,j), (255, 255, 255, int(gen[1])))
                    lastgen.append((i+1,j))
                if pixel[i-1,j] == (0, 0, 0, 0) and i-1 > 0:
                    image.putpixel((i-1,j), (255, 255, 255, int(gen[1])))
                    lastgen.append((i-1,j))
                if pixel[i,j-1] == (0, 0, 0, 0) and j-1 > 0:
                    image.putpixel((i,j-1), (255, 255, 255, int(gen[1])))
                    lastgen.append((i,j-1))

    for i in range(2,n):
        # iterate through all pixels (find the white ones)
        newgen = []
        for j in lastgen:
            x,y = j
            if y+1 < image.size[1] and pixel[x,y+1] == (0, 0, 0, 0):
                image.putpixel((x,y+1), (255, 255, 255, int(gen[i])))
                newgen.append((x,y+1))
            if  y-1 > 0 and pixel[x,y-1] == (0, 0, 0, 0):
                image.putpixel((x,y-1), (255, 255, 255, int(gen[i])))
                newgen.append((x,y-1))
            if x+1 < image.size[0] and pixel[x+1,y] == (0, 0, 0, 0):
                image.putpixel((x+1,y), (255, 255, 255, int(gen[i])))
                newgen.append((x+1,y))
            if x-1 > 0 and pixel[x-1,y] == (0, 0, 0, 0):
                image.putpixel((x-1,y), (255, 255, 255, int(gen[i])))
                newgen.append((x-1,y))    

        lastgen = newgen


    # blur all
    changes = []

    adds = []
    for i in range(5):
        for j in range(5):
            adds.append((i-2,j-2))

    adds.remove((0,0))

    for i in range(image.size[0]):
        for j in range(image.size[1]):
            counter = 1
            summ = pixel[i,j][3]
            
            if summ != 0 and summ != 255:
                for k in adds:
                    ax, ay = k
                    if i+ax > 0 and i+ax < image.size[0] and j+ay > 0 and j+ay < image.size[1]:
                        counter += 1
                        summ += pixel[i+ax,j+ay][3]
                
                changes.append([(i,j),summ/counter])

    for i in changes:
        image.putpixel(i[0], (137, 207, 240, int(i[1])))

    # antialiasing
    changes = []

    adds = []
    for i in range(5):
        for j in range(5):
            adds.append((i-2,j-2))

    adds.remove((0,0))

    for i in range(image.size[0]):
        for j in range(image.size[1]):
            counter = 1
            rs, gs, bs, summ = pixel[i,j]
            
            for k in adds:
                ax, ay = k
                if i+ax > 0 and i+ax < image.size[0] and j+ay > 0 and j+ay < image.size[1]:
                    counter += 1
                    summ += pixel[i+ax,j+ay][3]
                    rs += pixel[i+ax,j+ay][0]
                    gs += pixel[i+ax,j+ay][1]
                    bs += pixel[i+ax,j+ay][2]
                
            changes.append([(i,j),(int(rs/counter), int(gs/counter), int(bs/counter), int(summ/counter))])

    for i in changes:
        r,g,b,a = pixel[i[0][0],i[0][1]]
        image.putpixel(i[0], i[1])

    return image
