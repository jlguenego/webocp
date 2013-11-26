<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<pre>
<?php
define("SCRIPT_FILE", __FILE__);
require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');
header("Content-Type:text/html; charset=UTF-8;");

define('SQLLITE_FILE', ROOT . '/database/sqllite.db');

require_once(INCLUDE_DIR . '/misc.inc');

$result = array();
try {
	$b_create_db = !file_exists(SQLLITE_FILE);
	if(!$b_create_db) {
		$b_create_db |= file_get_contents(SQLLITE_FILE) == '';
	}

	mkdir_p(dirname(SQLLITE_FILE));
	$pdo = new PDO('sqlite:' . SQLLITE_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	echo 'Connected to ' . SQLLITE_FILE . "\n";

	if ($b_create_db) {
		echo 'Creating table "person"...' . "\n";
		$request = <<<EOF
CREATE TABLE person(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	lastname varchar(255),
	firstname varchar(255),
	age integer
)
EOF;
		$pst = $pdo->prepare($request);
		$pst->execute();
		echo 'Table "person" created.' . "\n";
		$request = <<<EOF
CREATE INDEX lastname ON person(lastname)
EOF;
		$pst = $pdo->prepare($request);
		$pst->execute();
		echo 'Index placed on "lastname".' . "\n";
	}

	$persons = array(
		array(
			'lastname' => 'TOTO',
			'firstname' => 'Titi',
			'age' => 34,
		),
		array(
			'lastname' => 'KEKE',
			'firstname' => 'Koko',
			'age' => 23,
		),
	);

	foreach ($persons as $person) {
		$request = <<<EOF
INSERT INTO person(lastname, firstname, age)
VALUES (:lastname, :firstname, :age)
EOF;
		$pst = $pdo->prepare($request);
		$pst->execute($person);
		echo 'Added ' . $person['firstname'] . ' to "person".' . "\n";
	}

	$request = <<<EOF
SELECT * FROM person
EOF;
	$pst = $pdo->prepare($request);
	$pst->execute();
	$result = $pst->fetchAll(PDO::FETCH_OBJ);
} catch(Exception $e) {
	echo $e->getMessage();
}
?>
		</pre>

		<table>
			<tr>
				<th>ID</th>
				<th>Firstname</th>
				<th>Lastname</th>
				<th>Age</th>
			</tr>
<?php
foreach ($result as $person) {
	$row = <<<EOF
			<tr>
				<td>{$person->id}</td>
				<td>{$person->firstname}</td>
				<td>{$person->lastname}</td>
				<td>{$person->age}</td>
			</tr>

EOF;
	echo $row;
}
?>
		</table>

	</body>
</html>