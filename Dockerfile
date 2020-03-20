FROM node:10
CMD ["bash"]
WORKDIR /usr/src/app
COPY package*.json ./ 
RUN npm install
RUN apt-get update
RUN apt-get install -y --no-install-recommends python3-pip
RUN pip3 install --upgrade setuptools
RUN pip3 install --no-cache-dir tensorflow>=1.12.0
RUN pip3 install --no-cache-dir argparse
RUN pip3 install --no-cache-dir numpy
RUN pip3 install --no-cache-dir opencv-python

COPY . . 

# start app 
EXPOSE 80
CMD npm start