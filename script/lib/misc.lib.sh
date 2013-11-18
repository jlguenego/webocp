debug_var() {
	CMD="echo ${1}=\${${1}}"
	eval "${CMD}"
}