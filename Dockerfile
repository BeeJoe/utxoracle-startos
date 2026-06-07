FROM python:3.9-slim

ARG BITCOIN_CORE_VERSION=31.0

RUN apt-get update && apt-get install -y wget tini && rm -rf /var/lib/apt/lists/*

# Install bitcoin-cli based on architecture
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ]; then \
        wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_CORE_VERSION}/bitcoin-${BITCOIN_CORE_VERSION}-aarch64-linux-gnu.tar.gz && \
        tar -xvf bitcoin-${BITCOIN_CORE_VERSION}-aarch64-linux-gnu.tar.gz && \
        mv bitcoin-${BITCOIN_CORE_VERSION}/bin/bitcoin-cli /usr/local/bin/ && \
        rm -rf bitcoin-${BITCOIN_CORE_VERSION}-aarch64-linux-gnu.tar.gz bitcoin-${BITCOIN_CORE_VERSION}; \
    elif [ "$ARCH" = "x86_64" ]; then \
        wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_CORE_VERSION}/bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz && \
        tar -xvf bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz && \
        mv bitcoin-${BITCOIN_CORE_VERSION}/bin/bitcoin-cli /usr/local/bin/ && \
        rm -rf bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz bitcoin-${BITCOIN_CORE_VERSION}; \
    else \
        echo "Unsupported architecture: $ARCH"; \
        exit 1; \
    fi


WORKDIR /app

COPY generate-html.py /app/generate-html.py
RUN chmod +x /app/generate-html.py

COPY utxoracle.py /app/utxoracle.py
RUN chmod +x /app/utxoracle.py

ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD utils/*.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/*.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
