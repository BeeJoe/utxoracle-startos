#!/bin/bash

set -e

check_complete() {
    if [ ! -f /tmp/utxoracle_exit_code ]; then
        echo "UTXOracle is still running"
        exit 60
    elif [ "$(cat /tmp/utxoracle_exit_code)" != "0" ]; then
        echo "UTXOracle failed with exit code $(cat /tmp/utxoracle_exit_code)" >&2
        exit 1
    else
        echo "UTXOracle completed successfully"
        exit 0
    fi
}

case "$1" in
    complete)
        check_complete
        ;;
    *)
        echo "Usage: $0 [command]" >&2
        echo
        echo "Commands:"
        echo "         complete"
        exit 1
        ;;
esac
