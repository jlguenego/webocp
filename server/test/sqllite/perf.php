<?php
define("SCRIPT_FILE", __FILE__);
require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

define('SQLLITE_FILE', ROOT . '/database/perf.db');

require_once(INCLUDE_DIR . '/misc.inc');

$nums = array(5, 10, 50, 100, 200, 500, 1000, 2000);

mkdir_p(dirname(SQLLITE_FILE));
$pdo = new PDO('sqlite:' . SQLLITE_FILE);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
echo 'Connected to ' . SQLLITE_FILE . "\n";

$b_create_db = file_get_contents(SQLLITE_FILE) == '';

if ($b_create_db) {
	echo 'Creating table "object"...' . "\n";
	$request = <<<EOF
CREATE TABLE object(
	address varchar(255) PRIMARY KEY,
	date_t varchar(255)
)
EOF;
	$pst = $pdo->prepare($request);
	$pst->execute();
	echo 'Table "object" created.' . "\n";


//	$request = <<<EOF
//CREATE INDEX address ON object(address)
//EOF;
//	$pst = $pdo->prepare($request);
//	$pst->execute();
//	echo 'Index placed on "address".' . "\n";
}

$request = <<<EOF
DELETE FROM object
EOF;
$pst = $pdo->prepare($request);
$pst->execute();
echo 'Table "object" cleaned.' . "\n";

$result = array();
foreach ($nums as $num) {
	$result[$num] = perf2($num);
	echo 'Executed ' . $num . ' times in ' . $result[$num] . 's' . "\n";
}
$json = json_encode($result);
echo $json;
mkdir_p(ROOT . '/tmp');
file_put_contents(ROOT . '/tmp/perf.json', $json);

function perf($num) {
	global $pdo;
	$request = <<<EOF
DELETE FROM object
EOF;
	$pst = $pdo->prepare($request);
	$pst->execute();

	echo 'Starting perf...' . "\n";
	$start = time();
	for ($i = 0; $i < $num; $i++) {
		$request = <<<EOF
INSERT INTO object(address, date_t)
VALUES (:address, :date_t)
EOF;
		$pst = $pdo->prepare($request);
		$pst->execute(array(
			'address' => sha1($i . '/' . $num),
			'date_t' => time(),
		));
	}
	$stop = time();
	return $stop - $start;
}

function perf2($num) {
	global $pdo;

	$request = <<<EOF
DELETE FROM object
EOF;
	$pst = $pdo->prepare($request);
	$pst->execute();

	$start = time();
	echo 'Starting perf...' . "\n";
	$request = '';
	for ($i = 0; $i < $num; $i++) {
		$address = sha1($i . '/' . $num);
		$time = time();
		$request .= <<<EOF
INSERT INTO object(address, date_t)
VALUES ('${address}', '${time}');
EOF;
	}
	$pdo->exec($request);
	$stop = time();
	return $stop - $start;
}
?>