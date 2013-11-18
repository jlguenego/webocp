#!/usr/bin/sh
set -eau

. lib/constant.lib.sh
. lib/misc.lib.sh
. lib/deploy.lib.sh

#ocp_make_archive

ocp_deploy_code -u eventbil -p Lx2AdFMz ftp.event-biller.com http://event-biller.com
#ocp_node_start http://event-biller.com/webocp/server/ebiller
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://event-biller.com/webocp/server/ebiller2
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://event-biller.com/webocp/server/ebiller3
#
#ocp_deploy_code "$HTTP_DIR/webocp_test"
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://localhost/webocp_test/webocp/server/yannishp1
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://localhost/webocp_test/webocp/server/yannishp2
#
#ocp_deploy_code ftp://ocpforum:QQJQnwdw@ftp.ocpforum.org http://ocpforum.org/webocp_test
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://ocpforum.org/webocp_test/webocp/server/ocpforum1
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://ocpforum.org/webocp_test/webocp/server/ocpforum2