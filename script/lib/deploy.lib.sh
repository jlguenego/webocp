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

	while getopts u:p: name
	do
		case $name in
			u)
				LOGIN="${OPTARG}"
				;;
			p)
				PASSWORD="${OPTARG}"
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
}

ocp_node_start() {
	echo 'ocp_node_start'
}
