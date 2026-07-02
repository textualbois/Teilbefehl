#!/bin/sh
set -eu

FRONTEND_DIR=${FRONTEND_DIR:-frontend}
NPM=${NPM:-npm}
HOST_PORT=${HOST_PORT:-5173}

IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)

if [ -n "$IP" ]; then
	echo "Website should be available at: http://$IP:$HOST_PORT"
else
	echo "Could not auto-detect your IP. Vite will still print its network URL below."
fi

cd "$FRONTEND_DIR" && "$NPM" run host -- --port "$HOST_PORT"
