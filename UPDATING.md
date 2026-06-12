# Updating UTXOracle for StartOS

## Determining the upstream version

UTXOracle is currently bundled as `utxoracle.py` in this repository. Compare it with the upstream script at:

```bash
curl -fsSL https://utxo.live/oracle/UTXOracle.py
```

Bitcoin Core CLI is installed in the package image from upstream Bitcoin Core binaries. The pinned version is `BITCOIN_CORE_VERSION` in `Dockerfile`.

## Applying the bump

1. Replace `utxoracle.py` if the upstream script changes.
2. Update `BITCOIN_CORE_VERSION` in `Dockerfile` when the bundled `bitcoin-cli` should track a new major Bitcoin Core release.
3. Update `startos/versions/current.ts` with the new ExVer package version and release notes.
4. If the update changes persistent data or config format, move the previous `current.ts` into a version-named file and add it to `startos/versions/index.ts` so migrations remain available.
