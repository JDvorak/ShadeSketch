import glob
import os
import argparse

parser = argparse.ArgumentParser(description='Shade Sketches')
parser.add_argument('--dir', type=str, default='810',
                    help='dir')
args = parser.parse_args()
gif_name = args.dir
print(args.dir)
file_list = glob.glob(args.dir+'/*.png') # Get all the pngs in the current directory
print(file_list[0])
list.sort(file_list, key=lambda x: int(x.split('.')[0].split('/')[1])) # Sort the images by #, this may need to be tweaked for your use case

with open('image_list.txt', 'w') as file:
    for item in file_list:
        file.write("%s\n" % item)

os.system('convert @image_list.txt {}.gif'.format(gif_name)) # On windows convert is 'magick'