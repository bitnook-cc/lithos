#!/bin/sh
set -eu

if [ "$(id -u)" = "0" ]; then
  for writable_dir in /workspace/node_modules /home/node/.codex; do
    if [ -d "$writable_dir" ]; then
      chown -R node:node "$writable_dir"
    fi
  done

  exec runuser -u node -- "$@"
fi

exec "$@"
