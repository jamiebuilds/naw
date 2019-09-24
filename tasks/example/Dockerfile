#### Stage: builder ####
FROM buildpack-deps as builder
WORKDIR /

# Setup your tool...
COPY script.sh .
RUN chmod +x script.sh

WORKDIR /workdir
ENTRYPOINT [ "/script.sh" ]

#### Stage: tester ####
FROM builder as tester
WORKDIR /
RUN git clone https://github.com/sstephenson/bats.git
RUN ./bats/install.sh /usr/local
COPY test.bats .
WORKDIR /workdir
ENTRYPOINT [ "bats" ]
CMD [ "/test.bats" ]
