#!/usr/bin/sh
set -eau
cd "${WEBOCP_DIR}"
FILE_LIST=`find . -type f |\
	grep -v '\.git' |\
	grep '\.js$' |\
	grep -v 'client/_ext' |\
	grep -v 'client/test/' |\
	xargs wc`

echo "$FILE_LIST"