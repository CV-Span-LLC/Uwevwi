#!/bin/sh
# Starts the app as the unprivileged `node` user. A volume mounted by a hosting panel is often owned by root,
# so when started as root this first hands the data folder to `node`, then drops privileges.
set -e
if [ "$(id -u)" = "0" ]; then
  if [ -n "$DATA_DIR" ]; then
    mkdir -p "$DATA_DIR"
    if [ "$(stat -c %U "$DATA_DIR")" != "node" ]; then chown -R node:node "$DATA_DIR"; fi
  fi
  exec setpriv --reuid=node --regid=node --init-groups "$@"
fi
exec "$@"
