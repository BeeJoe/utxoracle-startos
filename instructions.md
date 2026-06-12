# Instructions for UTXOracle

Before starting UTXOracle, install and start Bitcoin Core on the same StartOS server. UTXOracle reads Bitcoin Core's local `.cookie` file from `/mnt/bitcoind/.cookie` and raw block files from `/mnt/bitcoind/blocks`, so no RPC username or password is required.

Use the Configure action to enter the desired UTC date to evaluate. If no argument is given, `-rb` recent block mode is assumed.

`YYYY/MM/DD` specifies a UTC date to evaluate.

Recent block mode uses the last 144 recent blocks.

This package is wrapper for [UTXOracle](https://utxo.live/oracle/) by [@SteveSimple](https://twitter.com/SteveSimple).
