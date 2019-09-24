#!/bin/bash
set -euo pipefail
set -f # disable automatic globbing

chalk -t "{bold {magenta [eslint]} Linting...}"

exit_code=0

# shellcheck disable=SC2068
/node_modules/.bin/eslint $@ \
  --ext=js,ts,tsx \
  --cache \
  --max-warnings 0 \
  --color \
  --format=pretty || exit_code=$?

if [ $exit_code -eq 0 ]; then
  chalk -t "\n{bold {cyan [eslint]} No problems found.}"
fi

exit $exit_code
