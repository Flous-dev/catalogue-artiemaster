#!/bin/sh
url=$1; name=$2; out=/Users/krikachali/Documents/Clothing/catalogue/img/$name.jpg
[ -s "$out" ] && exit 0
tmp=$(mktemp)
for t in 1 2 3; do
  curl -s -m 40 -H "Referer: https://artiemaster.x.yupoo.com/" -A "Mozilla/5.0 Chrome/120" "$url" -o $tmp
  if file $tmp | grep -q JPEG; then
    case $name in *_c) sz=700;; *) sz=700;; esac
    sips -Z $sz -s formatOptions low $tmp --out $out >/dev/null 2>&1; rm -f $tmp; exit 0
  fi
  sleep 2
done
rm -f $tmp; echo "FAIL $url $name"
