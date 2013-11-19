#!/usr/bin/sh
set -eau

. lib/constant.lib.sh
. lib/misc.lib.sh
. lib/deploy.lib.sh

ocp_make_archive
ocp_deploy_code -u eventbil -p Lx2AdFMz -d "/www" ftp.event-biller.com http://event-biller.com
ocp_deploy_code -u ocpforum -p QQJQnwdw -d "/www" -i "webocp_test" ftp.ocpforum.org http://ocpforum.org