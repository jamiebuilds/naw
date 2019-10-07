FROM node:12.1.0-stretch
WORKDIR /
COPY package.json .
COPY package-lock.json .
RUN npm ci && test -d node_modules
RUN npm i -g chalk-cli@4.1.0
COPY script.sh .
RUN chmod +x script.sh
WORKDIR /workdir
ENTRYPOINT [ "/script.sh" ]
