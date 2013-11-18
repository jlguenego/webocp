#!/usr/bin/sh
set -eau

ROOT_DIR="../.."
. "${ROOT_DIR}/lib/misc.lib.sh"

PROG=$(basename $0)
set +e; getopt -T > /dev/null; STATUS=$?; set -e
if [ "${STATUS}" -eq 4 ]; then
	# GNU enhanced getopt is available
	ARGS=$(getopt --name "$PROG" --long coucou,bonjour:,hello --options cb:h -- "$@")
else
	# Original getopt is available (no long option names, no whitespace, no sorting)
	ARGS=$(getopt cb:h "$@")
fi
debug_var ARGS

eval set -- $ARGS

while [ $# -gt 0 ]; do
    case "$1" in
        -c | --coucou)
        	HELP=yes
        	;;
        -b | --bonjour)
        	OUTFILE="$2"
        	shift
        	;;
        -h | --hello)
        	VERBOSE=yes
        	;;
        --)
        	shift
        	break
        	;; # end of options
    esac
    shift
done


