FROM buildpack-deps
WORKDIR /
COPY script.sh .
RUN chmod +x script.sh
WORKDIR /workdir
ENTRYPOINT [ "/script.sh" ]
