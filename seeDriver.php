<?php

//may not need this, check updateDriverMarkers() on rider.js

// Connecting, selecting database
$dbconn = pg_connect("host=localhost dbname=uberjr")
    or die('Could not connect: ' . pg_last_error());

// Performing SQL query
$query = 'SELECT  * FROM riders WHERE id =1';
$result = pg_query($query) or die('Query failed: ' . pg_last_error());

// Printing results in HTML
echo "<table>\n";
while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
    echo "\t<tr>\n";
    foreach ($line as $col_value) {
        echo "\t\t<td>$col_value</td>\n";
    }
    echo "\t</tr>\n";
}
echo "</table>\n";

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);
?>
