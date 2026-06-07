<p align="center">
  <img src="icon.png" alt="UTXOracle Logo" width="21%">
</p>

# UTXOracle on StartOS

> **Upstream docs:** <https://utxo.live/oracle/>
>
> Everything not listed in this document should behave the same as upstream
> UTXOracle. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

UTXOracle estimates the price of bitcoin by analyzing patterns in local
on-chain transaction data. This StartOS package runs UTXOracle against the
Bitcoin Core service on the same server and serves the generated result page
through a web interface.

## Image and Container Runtime

This package builds a custom Python container from the local `Dockerfile`.
The image includes `utxoracle.py`, `generate-html.py`, `bitcoin-cli`, the
StartOS entrypoint, and health-check helper scripts.

The entrypoint writes a temporary status page, starts the web server
immediately, waits for Bitcoin Core RPC readiness, runs UTXOracle, and then
serves the generated `index.html` result page. If UTXOracle exits with an
error, the entrypoint keeps the web server running and replaces the status page
with a failure page.

Supported architectures are declared in `startos/manifest/index.ts`.

## Volume and Data Layout

This package owns one StartOS volume:

| Volume | Container Mount | Purpose |
| --- | --- | --- |
| `main` | `/root` | Stores `config.main` and service-local runtime state. |

The Bitcoin Core dependency volume is mounted read-only at `/mnt/bitcoind`.
UTXOracle reads the Bitcoin Core RPC cookie and raw block files from that
mount. If a target block is not found in the mounted raw block files, UTXOracle
fetches the serialized block from the local Bitcoin Core RPC interface.

## Installation and First-Run Flow

Install Bitcoin Core on the same StartOS server before starting UTXOracle.
On install or update, the package normalizes `config.main` with StartOS-managed
RPC and block-file settings. No RPC username or password is generated or stored
by this package.

When the service starts, the web interface becomes available first with a
temporary status page. The final UTXOracle result page appears after block
analysis completes.

## Configuration Management

StartOS manages the runtime config file at `/root/config.main`.

| StartOS-Managed Setting | Purpose |
| --- | --- |
| `network` | Locks the package to bitcoin mode. |
| `rpccookiefile` | Points to the mounted Bitcoin Core RPC cookie. |
| `bitcoin-rpcconnect` | Points to the local StartOS Bitcoin Core service. |
| `bitcoin-rpcport` | Points to the Bitcoin Core RPC port. |
| `blocksdir` | Points to the mounted Bitcoin Core raw block directory. |
| `bind-addr` | Preserves the historical package setting. |
| `alias` | Preserves the historical package setting. |
| `argument` | Stores the optional UTXOracle mode/date argument. |

Users should change only the UTXOracle argument through the Configure action.

## Network Access and Interfaces

| Interface | Protocol | Purpose |
| --- | --- | --- |
| Web Interface | HTTP | Serves the temporary status page and generated UTXOracle result page. |

The interface port is declared in `startos/interfaces.ts`.

## Actions

| Action | Availability | Purpose |
| --- | --- | --- |
| Configure | Any status | Sets the optional UTXOracle runtime argument. |

The Configure action accepts blank input for recent block mode, `rb` for recent
block mode, `y` for yesterday, or a UTC date in the format shown in the action
placeholder.

## Backups and Restore

Backups include the `main` volume. Restore uses the standard StartOS SDK backup
flow for that volume. The Bitcoin Core dependency volume is not backed up by
this package.

## Health Checks

| Health Check | Purpose |
| --- | --- |
| Web Interface | Confirms the HTTP server is listening. |
| UTXOracle Completion | Reports loading while UTXOracle is still running, success after a clean run, and failure after a nonzero exit. |

## Dependencies

Bitcoin Core is required. The dependency version range and required health
checks are declared in `startos/dependencies.ts`.

UTXOracle uses Bitcoin Core for local RPC calls, RPC cookie authentication, and
access to raw block data. The Bitcoin Core dependency volume is mounted
read-only.

## Limitations and Differences

1. UTXOracle connects only to the Bitcoin Core service on the same StartOS
   server.
2. The web interface is a static HTTP server that serves the generated
   UTXOracle result page.
3. UTXOracle does not store Bitcoin Core RPC usernames or passwords.
4. The result page updates when the service is run again; this package does not
   provide a live streaming price feed.

## What Is Unchanged from Upstream

The UTXOracle price calculation logic remains the upstream script logic. This
package changes only StartOS packaging, dependency wiring, runtime paths, and
service lifecycle behavior.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Quick Reference for AI Consumers

```yaml
package_id: utxoracle
architectures:
  - x86_64
  - aarch64
volumes:
  main: /root
dependency_mounts:
  bitcoind_main: /mnt/bitcoind
ports:
  web: http
dependencies:
  - bitcoind
startos_managed_env_vars: []
actions:
  - configure
health_checks:
  - primary
  - complete
```
