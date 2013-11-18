#!/usr/bin/sh
set -eau

. lib/constant.lib.sh
. lib/misc.lib.sh
. lib/deploy.lib.sh

ocp_make_archive

ocp_deploy_code -u eventbil -p Lx2AdFMz -d "/www" ftp.event-biller.com http://event-biller.com

#Start a first node
ocp_node_start \
		-d 'name=ebiller' \
		-d 'url=http://event-biller.com/webocp/server/ebiller' \
		-d 'quota=1' \
		"http://event-biller.com/webocp/server/ebiller/endpoint/start.php"

#Start a second node
ocp_node_start \
		-d 'name=ebiller2' \
		-d 'url=http://event-biller.com/webocp/server/ebiller2' \
		-d 'sponsor=http://event-biller.com/webocp/server/ebiller' \
		-d 'quota=1' \
		"http://event-biller.com/webocp/server/ebiller2/endpoint/start.php"

ocp_node_start \
		-d 'name=ebiller3' \
		-d 'url=http://event-biller.com/webocp/server/ebiller3' \
		-d 'sponsor=http://event-biller.com/webocp/server/ebiller' \
		-d 'quota=1' \
		"http://event-biller.com/webocp/server/ebiller3/endpoint/start.php"

ocp_deploy_code_local "$HTTP_DIR/webocp_test"
IP=$(get_external_ip)
PORT=48123

ocp_node_start \
		-d 'name=yannishp1' \
		-d "url=http://${IP}:${PORT}/webocp_test/webocp/server/yannishp1" \
		-d 'b_lan=true' \
		-d 'lan_url=http://yannis-hp/webocp_test/webocp/server/yannishp1' \
		-d 'b_nat=true' \
		-d 'sponsor=http://event-biller.com/webocp/server/ebiller' \
		-d 'quota=1' \
		"http://yannis-hp/webocp_test/webocp/server/yannishp1/endpoint/start.php"

ocp_node_start \
		-d 'name=yannishp2' \
		-d "url=http://${IP}:${PORT}/webocp_test/webocp/server/yannishp2" \
		-d 'b_lan=true' \
		-d 'lan_url=http://yannis-hp/webocp_test/webocp/server/yannishp2' \
		-d 'b_nat=true' \
		-d 'sponsor=http://event-biller.com/webocp/server/ebiller' \
		-d 'quota=1' \
		"http://yannis-hp/webocp_test/webocp/server/yannishp2/endpoint/start.php"

#ocp_deploy_code ftp://ocpforum:QQJQnwdw@ftp.ocpforum.org http://ocpforum.org/webocp_test
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://ocpforum.org/webocp_test/webocp/server/ocpforum1
#ocp_node_start -s http://event-biller.com/webocp/server/ebiller http://ocpforum.org/webocp_test/webocp/server/ocpforum2