app.controller('thresholdCtrl', ['$scope', 'socket', function($scope, socket) {    

    /* Scan parameters */

    $scope.vfat2ID = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 1000;

    /* Launch the scan */

    $scope.start_scan = function() {   
        socket.ipbus_write(0x42000001, 0);
        socket.ipbus_write(0x42000002, $scope.vfat2ID);
        socket.ipbus_write(0x42000004, $scope.minVal);
        socket.ipbus_write(0x42000005, $scope.maxVal);
        socket.ipbus_write(0x42000006, $scope.steps);
        socket.ipbus_write(0x42000007, $scope.nEvents);
        socket.ipbus_write(0x42000000, 1);

        setTimeout(collect_result, 1000);
    };

    function collect_result() {
        if ($scope.scan_is_running) setTimeout(collect_result, 1000);
        else {
            var nSamples = $scope.maxVal - $scope.minVal;
            chartData.removeRows(0, chartData.getNumberOfRows());

            for (var i = 0; i <= nSamples; ++i) {
                socket.ipbus_read(0x42000008, function(data) {
                    chartData.addRow([ (data >> 24) & 0xFF, (data & 0x00FFFFFF) / (1. * $scope.nEvents) * 100 ]);
                    draw_chart();
                });
            }
        }
    }

    /* Chart */

    var chartData = new google.visualization.DataTable();
    chartData.addColumn('number', 'X');
    chartData.addColumn('number', 'Percentage');

    function draw_chart() {
        var chart = new google.visualization.LineChart(document.getElementById('threshold_chart'));
    
        var options = {
            hAxis: {
                title: 'Threshold'
            },
            vAxis: {
                title: 'Percentage'
            },
            height: 300,
            legend: {
                position: 'none'
            }
        };    

        chart.draw(chartData, options);
    }

    /* Scan status*/

    $scope.scan_is_running = false;
        
    function is_scan_running() {
        socket.ipbus_read(0x42000009, function(data) { 
            $scope.scan_is_running = (data == 0 ? false : true);
        });    
    };

    function is_scan_running_loop() {
        is_scan_running();
        setTimeout(is_scan_running_loop, 500);
    }

    is_scan_running_loop();

}]);