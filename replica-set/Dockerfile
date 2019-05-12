FROM mongo:3.6-stretch

COPY secure.keyFile /secure.keyFile
RUN chown mongodb:mongodb /secure.keyFile && chmod 400 /secure.keyFile
