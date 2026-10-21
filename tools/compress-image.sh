#!/usr/bin/env bash
# 把照片压缩成 WebP 的通用脚本（原图不动，输出新文件）
# 依赖：cwebp（macOS: brew install webp）
# 用法：./tools/compress-image.sh <原图> [输出文件] [宽度] [质量]
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "用法: $0 <原图> [输出文件] [宽度=4000] [质量=95]"
  exit 1
fi

input="$1"
output="${2:-${input%.*}.webp}"
width="${3:-4000}"
quality="${4:-95}"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "找不到 cwebp，请先执行: brew install webp" >&2
  exit 1
fi

cwebp -q "$quality" -resize "$width" 0 -m 6 -mt "$input" -o "$output"
ls -lh "$output"
