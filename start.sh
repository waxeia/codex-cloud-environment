#!/usr/bin/env bash
set -euo pipefail

app_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
app_image="$app_dir/Mimi-Note-1.0.0.AppImage"

if [[ ! -e "$app_image" && -e "$app_dir/咪咪便签-1.0.0.AppImage" ]]; then
  app_image="$app_dir/咪咪便签-1.0.0.AppImage"
fi

if [[ ! -x "$app_image" ]]; then
  chmod +x "$app_image"
fi

exec "$app_image" "$@"
