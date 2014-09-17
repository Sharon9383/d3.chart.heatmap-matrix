'use strict';


module.exports = function() {
var d3 = require('d3');
var ld = require('lodash')
var Miso = require('miso.dataset')
var colorbrewer = require('../colorbrewer')
var chart = require('d3.chart.heatmap');
var quartile_utils = require('./quartile_utils.js')
var d3tip = require('d3.tip')
var horizLegend = require('./d3.chart.horizontal-legend.min.js')


d3.csv("/percentile/time.csv", function(d) {

    var ds = new Miso.Dataset({
        data: d,
    });

    ds.fetch({
        success: function() {
            var columns = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 
                           'Friday', 'Saturday', 'Sunday']

            /*
            var selectedColumn = 'Monday';
            ds.sort(function(rowA, rowB) { 
                return d3.ascending(rowA[selectedColumn], rowB[selectedColumn]); 
            });
            */

           var tip = d3.tip()
                .attr('class', 'd3-tip')
                .html(function(d) { 
                    return d[0] + ", " + quartile_utils.percentileString(d[1])
                })
                .direction('n')
                .offset([0, 0])


            var palette = 'RdYlGn'
            var numClasses = 11

            var colors = d3.scale.quantize().domain([0,1]).range(colorbrewer[palette][numClasses])

            var legendDiv = d3.select("#vis")
                .append("div")
                .attr("id", "legend")
                .style("margin-left", '100px')
                .style("margin-top", '20px')
                .style("margin-bottom", '20px')


            var legend = legendDiv.append("svg")
                .chart("HorizontalLegend")
                .height(20)
                .width(300)
                .padding(5)
                .boxes(9)
            legend.draw(colors)


            var chart = d3.select('#vis').append('svg')
                          .call(tip)
                          .chart('Heatmap')
                          .width(1024).height(768)
                          .colorScale(colors)
                          // Override default rowData functionality to use percentile fields
                          .rows(function(d) { return d.rows; })
                          .rowData(function(d) { return ld.zip(d.values, d.percentiles); })
                          .color(function(d) { return d[1]; })
                          .selectedColumn('Time')
                          .tip(tip)

            var data = require('./data');
            var objrows = ds.toJSON()

            var quartiles = quartile_utils.computeColumnQuartiles(ds, columns)

            var params = {}
            params.columns = columns
            params.rows = quartile_utils.datasetToRows(ds, columns, 'Time')
            params.rows = quartile_utils.rowsToPercentiles(params, quartiles)

            chart.draw(params)

        }
    });


});





}

