#!/bin/sh

set -eu

CONFIG="${HOME}/config.main"

webserver_pid=""
utxoracle_pid=""

terminate() {
    if [ -n "$utxoracle_pid" ]; then
        kill "$utxoracle_pid" 2>/dev/null || true
        wait "$utxoracle_pid" 2>/dev/null || true
    fi
    if [ -n "$webserver_pid" ]; then
        kill "$webserver_pid" 2>/dev/null || true
        wait "$webserver_pid" 2>/dev/null || true
    fi
    exit 143
}

trap terminate TERM INT

get_config() {
    awk -F'=' -v key="$1" '$1 == key {print substr($0, index($0, "=") + 1); exit}' "$CONFIG"
}

argument_value="$(get_config argument || true)"
rpc_cookie_file="$(get_config rpccookiefile || true)"
rpc_host="$(get_config bitcoin-rpcconnect || true)"
rpc_port="$(get_config bitcoin-rpcport || true)"

: "${rpc_cookie_file:=/mnt/bitcoind/.cookie}"
: "${rpc_host:=bitcoind.startos}"
: "${rpc_port:=8332}"

write_status_page() {
    title="$1"
    message="$2"
    cat >/app/index.html <<EOF
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="15">
  <title>${title}</title>
  <style>
    body { background: #111; color: #eee; font-family: sans-serif; margin: 3rem; line-height: 1.5; }
    main { max-width: 42rem; }
    code { background: #222; padding: 0.1rem 0.3rem; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${message}</p>
    <p>This page refreshes automatically. Check the StartOS logs for detailed progress.</p>
  </main>
</body>
</html>
EOF
}

start_webserver() {
    printf "\n\n [i] Starting Webserver ...\n\n"
    python3 -m http.server 80 --directory /app &
    webserver_pid=$!
}

wait_for_bitcoin() {
    while true; do
        if [ ! -f "$rpc_cookie_file" ]; then
            echo "Waiting for Bitcoin Core RPC cookie at $rpc_cookie_file..."
            sleep 10
            continue
        fi

        if bitcoin-cli \
            -rpccookiefile="$rpc_cookie_file" \
            -rpcconnect="$rpc_host" \
            -rpcport="$rpc_port" \
            getblockchaininfo >/tmp/bitcoin-blockchaininfo 2>/tmp/bitcoin-cli-error; then
            if grep -q '"initialblockdownload": false' /tmp/bitcoin-blockchaininfo; then
                return 0
            fi
            echo "Waiting for Bitcoin Core to finish initial block download..."
        else
            echo "Waiting for Bitcoin Core RPC at ${rpc_host}:${rpc_port}..."
            cat /tmp/bitcoin-cli-error || true
        fi
        sleep 10
    done
}

run_utxoracle() {
    case "$argument_value" in
        ""|start9*)
            echo "running utxoracle.py without argument"
            python3 /app/utxoracle.py
            ;;
        y|-y)
            echo "running utxoracle.py -y"
            python3 /app/utxoracle.py -y
            ;;
        rb|-rb)
            echo "running utxoracle.py -rb"
            python3 /app/utxoracle.py -rb
            ;;
        [0-9][0-9][0-9][0-9]/[0-9][0-9]/[0-9][0-9])
            echo "running utxoracle.py -d $argument_value"
            python3 /app/utxoracle.py -d "$argument_value"
            ;;
        -*)
            echo "running utxoracle.py $argument_value"
            python3 /app/utxoracle.py "$argument_value"
            ;;
        *)
            echo "running utxoracle.py -$argument_value"
            python3 /app/utxoracle.py "-$argument_value"
            ;;
    esac
}

rm -f /tmp/utxoracle_exit_code
write_status_page "UTXOracle is running" "Waiting for Bitcoin Core and preparing the local block analysis."
start_webserver
wait_for_bitcoin
set +e
run_utxoracle &
utxoracle_pid=$!
wait "$utxoracle_pid"
exit_code=$?
utxoracle_pid=""
set -e
echo "$exit_code" > /tmp/utxoracle_exit_code

if [ "$exit_code" -ne 0 ]; then
    write_status_page "UTXOracle failed" "UTXOracle exited with code ${exit_code} before generating a result page."
fi

wait "$webserver_pid"
