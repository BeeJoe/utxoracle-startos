<p align="center">
  <img src="icon.png" alt="Project Logo" width="21%">
</p>

# UTXOracle for StartOS

What is UTXOracle?

UTXOracle is the decentralized alternative to knowing the price of bitcoin.

Instead of relying on prices given by exchanges, the open-source program [UTXOracle.py](https://utxo.live/oracle/UTXOracle.py) determines the price by analyzing patterns of on-chain transactions.

The program connects to a local bitcoin node and no other outside sources. Everyone who independently runs this code will get the same price estimate.

## StartOS package behavior

This package runs `utxoracle.py` in a Python container and serves the generated `index.html` on port 80. It starts the web server with a temporary status page while UTXOracle runs, then serves the generated result page when analysis completes. It installs `bitcoin-cli` from Bitcoin Core 31.0 binaries and connects only to the local Bitcoin Core service on the same StartOS server.

UTXOracle depends on the StartOS `bitcoind` package. The dependency is declared in `startos/manifest/index.ts` and currently requires Bitcoin Core `>=31.0:0 <32.0.0:0` with the `sync-progress` health check passing. At runtime, the Bitcoin Core `main` volume is mounted read-only at `/mnt/bitcoind`; UTXOracle authenticates to RPC with `/mnt/bitcoind/.cookie`, reads raw block files from `/mnt/bitcoind/blocks`, and connects to `bitcoind.startos:8332`. If a target block is not found in the mounted raw block files, UTXOracle fetches that serialized block from the local Bitcoin Core RPC interface.

The service stores StartOS-managed package state in the `main` volume mounted at `/root`. The generated `config.main` contains only local runtime settings: RPC host, RPC port, cookie path, block file path, alias, and the optional UTXOracle argument. RPC usernames and passwords are not stored in this package.

## Build requirements

Follow the [StartOS packaging environment setup](https://docs.start9.com/packaging/0.4.0.x/environment-setup.html). This package uses the StartOS 0.4 SDK TypeScript layout:

- `@start9labs/start-sdk` in `package.json`
- package metadata in `startos/manifest/index.ts`
- version metadata in `startos/versions/current.ts`
- lifecycle exports in `startos/index.ts`
- shared build logic in `s9pk.mk`

## Cloning

Clone the project locally:

```
git clone https://github.com/citizenanalog/utxoracle-startos.git
cd utxoracle-startos
```

## Building

Install npm dependencies and build the package:

```
npm ci
make
```

To build a single architecture:

```
make x86
make arm
```

## Installing (on StartOS)

Run the following commands to determine successful install:
> :information_source: Change server-name.local to your Start9 server address

```
start-cli auth login
# Enter your StartOS password
start-cli --host https://server-name.local package install utxoracle.s9pk
```

If you already have your `start-cli` config file setup with a default `host`, you can install simply by running:

```
make install
```

> **Tip:** You can also install the utxoracle.s9pk using **Sideload Service** under the **System > Manage** section.

### Verify Install

Go to your StartOS Services page, select **UTXOracle**, configure and start the service. Then, verify its interfaces are accessible.

**Done!** 
