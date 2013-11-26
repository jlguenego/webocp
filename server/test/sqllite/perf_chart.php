<?php

define("SCRIPT_FILE", __FILE__);
require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');
header("Content-Type:text/html; charset=UTF-8;");

?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<base href="../.." />
		<script src="_ext/jquery-1.10.2.min.js"></script>
		<script src="_ext/highcharts.js"></script>

		<style>

body, html {
	margin: 10px;
	padding: 0;
	background-color: #F5F5F5;
	font-family: sans-serif;
}

#graph {
	display: inline-block;
	overflow: hidden;
}

#page {
	width: 100%;
	height: 100%;
}
		</style>
	</head>
	<body>
		<div id="page">
			<div id="container"></div>
		</div>
		<script>
$(function () {
	var str = '<?php echo file_get_contents(ROOT . "/tmp/perf.json"); ?>';
	var json = JSON.parse(str);
	console.log(json);

	var data = [];

	for (var i in json) {
		data.push([parseInt(i), json[i]]);
	}
	console.log(data);

    $('#container').highcharts({
        chart: {
            type: 'line'
        },
    	title: {
    		text: 'SQLite'
    	},
    	subtitle: {
    		text: 'Insert line perf',
    	},
        yAxis: {
    		title: {
    			text: 'Time (s)'
    		},
			labels: {
				formatter: function() {
					return this.value + 's';
				}
			},
    		showFirstLabel: false
        },
        xAxis: {
    		title: {
    			text: 'Line inserted'
    		},
        },
    	tooltip: {
    		formatter: function() {
    			return '<b>'+ this.series.name +'</b>:<br/>' + this.y + ' lines inserted in ' + this.x + 's';
    		}
    	},
        series: [
        	{
        		name: 'Performances',
				data: data,
				showInLegend: false
			}
		]
    });
});
		</script>
	</body>
</html>