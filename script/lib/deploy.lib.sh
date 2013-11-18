ocp_make_archive() {
	echo 'Creating zip file...'
	mkdir -p "${TEMP_DIR}"
	rm -rf "${ZIP_FILE}"

	(
		cd "${HTTP_DIR}"
		zip -r "${ZIP_FILE}" "webocp/server" > /dev/null
	)
	echo 'Zip file created.'
}

ocp_deploy_code() {
	echo 'ocp_deploy_code'
	LOGIN=
	PASSWORD=
	FTP_DIR=
	MY_PATH=/

	while getopts u:p:d: name
	do
		case $name in
			u)
				LOGIN="${OPTARG}"
				;;
			p)
				PASSWORD="${OPTARG}"
				;;
			d)
				FTP_DIR="${OPTARG}"
				;;
			?)
				printf "Usage: %s: [-a] [-b value] args\n"  $0
				exit 2
				;;
		esac
	done
	shift $(($OPTIND - 1))
	FTP_HOST="${1}"
	HTTP_HOST="${2}"

	debug_var LOGIN
	debug_var PASSWORD
	debug_var FTP_HOST
	debug_var HTTP_HOST

	cat > "${SCRIPT_FILE}" <<EOF
<?php
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	header('Cache-Control: no-cache, must-revalidate');

	\$zip = new ZipArchive();
	try {
		if (!\$zip->open('${B_ZIP_FILE}')) {
			throw new Exception('Cannot open ${SCRIPT_FILE}');
		}

		\$zip->extractTo('./');
		echo 'OK';
	} catch(Exception \$e) {
		echo \$e->getMessage();
	}
?>
EOF

	cat > "${FTP_SCRIPT}" <<EOF
quote USER ${LOGIN}
quote PASS ${PASSWORD}
EOF
	if [ -n FTP_DIR ]; then
		cat >> "${FTP_SCRIPT}" <<EOF
cd ${FTP_DIR}
EOF
	fi

	cat >> "${FTP_SCRIPT}" <<EOF
put $(basename ${ZIP_FILE})
put ${B_SCRIPT_FILE}
quit
EOF
	(
		cd "${TEMP_DIR}"
		ftp -n "${FTP_HOST}" < "${FTP_SCRIPT}"
	)

	curl "${HTTP_HOST}/${B_SCRIPT_FILE}"

#Housekeeping
	cat > "${FTP_SCRIPT}" <<EOF
quote USER ${LOGIN}
quote PASS ${PASSWORD}
EOF
	if [ -n FTP_DIR ]; then
		cat >> "${FTP_SCRIPT}" <<EOF
cd ${FTP_DIR}
EOF
	fi

	cat >> "${FTP_SCRIPT}" <<EOF
delete $(basename ${ZIP_FILE})
delete ${B_SCRIPT_FILE}
quit
EOF

	(
		cd "${TEMP_DIR}"
		ftp -n "${FTP_HOST}" < "${FTP_SCRIPT}"
	)

	rm -rf "${FTP_SCRIPT}";
	rm -rf "${SCRIPT_FILE}";
}

ocp_node_start() {
	echo 'Start a node...'
	curl -X POST "${@:-}"
}