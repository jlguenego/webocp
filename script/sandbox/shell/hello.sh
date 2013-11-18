#!/usr/bin/sh
set -eau

echo "${@:-}"
echo "${*}"
echo $#

set -- "toto atat" titi kiki

echo "${@:-}"
echo "${*}"
echo $#

i=1
while ((i <= $#))
do
	CMD="echo ${i}=\${${i}}"
	eval "${CMD}"
	((i++))
done