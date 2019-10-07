ARG baseImage
ARG testFiles
FROM ${baseImage}
WORKDIR /
RUN git clone https://github.com/sstephenson/bats.git
RUN ./bats/install.sh /usr/local
COPY ${testFiles} .
WORKDIR /workdir
ENTRYPOINT [ "bats" ]
CMD [ "/" ]
