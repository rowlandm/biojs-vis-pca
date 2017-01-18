/*
 * biojs-vis-pca
 * https://github.com/tingxuanz/biojs-vis-pca
 *
 * Copyright (c) 2016 tingxuan zhang
 * Licensed under the Apache-2.0 license.
 */

/**
@class biojsvispca
 */

//a tutorial for drawing scatter plot with d3.js
//http://bl.ocks.org/mbostock/3887118
var  biojsvispca;
module.exports = biojsvispca = function(init_options){

  //define options as defaults
  default_options = function(){
    var options = {
        margin:{top: 20, right: 20, bottom: 30, left: 40},
        width: 960 - 40 - 20,
        height: 500 - 20 - 30
    }
    return options;
  };

//setup margins
  setup_margins = function(graph){
    options = graph.options;
    page_options.margin = options.margin;
    page_options.width = options.width - page_options.margin.left - page_options.margin.right;
    page_options.height = options.height - page_options.margin.top - page_options.margin.bottom;
    page_options.barChartHeight = options.barChartHeight - page_options.margin.left - page_options.margin.right;
    page_options.barChartWidth = options.barChartWidth - page_options.margin.top - page_options.margin.bottom;
    page_options.fullWidth = options.fullWidth;
    page_options.fullHeight = options.fullHeight;

    graph.page_options = page_options;
    return graph;
  };

  setup_x_axis = function(graph){
    var page_options = graph.page_options;
    var svg = graph.svgForPCA;
    var options = graph.options;
    //setup the scale for x axis, this is a linear scale
    var scaleX = d3.scale.linear()
        .range([0,page_options.width]);
    //setup domain
    scaleX.domain(d3.extent(options.data,
      function(d){
        var xDomain;
        xDomain = d[options.xDomain];
        return xDomain;
      })).nice();
    //setup xaxis
    var xAxis = d3.svg.axis()
        .scale(scaleX)
        .orient("bottom");

    //append as a group
    svg.append("g")
        .attr("class", "xAxis axis")
        .attr("transform", "translate(0," + page_options.height +")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", page_options.width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(options.x_axis_title);
    graph.svgForPCA = svg;
    graph.scaleX = scaleX;
    return graph;
  };

  setup_y_axis = function(graph){
    var page_options = graph.page_options;
    var svg = graph.svgForPCA;
    var options = graph.options;
    //setup the scale for y axis, this is a linear scale
    var scaleY = d3.scale.linear()
        .range([page_options.height, 0]);
    //setup domain
    scaleY.domain(d3.extent(options.data,
      function(d){
        var yDomain;
        yDomain = d[options.yDomain];
        return yDomain;
      })).nice();
    //setup y axis
    var yAxis = d3.svg.axis()
        .scale(scaleY)
        .orient("left");

    //append as a group
    svg.append("g")
        .attr("class", "yAxis axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(options.y_axis_title);
    graph.svgForPCA = svg;
    graph.scaleY = scaleY;
    graph.yAxis = yAxis;
    return graph;
  };
  /**
   * Sets up the actual scatter points on the graph, assigns colours based on
   * types also has a tooltip (see simple.js for tooltip setup)
   * with relevent info aobut each point
   * @param {type} graph
   * @returns {unresolved}
   */

  setup_scatter = function(graph){
    svg = graph.svgForPCA;
    options = graph.options;
    page_options = graph.page_options;

    tooltip = options.tooltip;
    svg.call(tooltip);


    if(options.colorDomain != undefined){
      page_options.colorDomain = options.colorDomain;
      page_options.color = d3.scale.ordinal().domain(page_options.colorDomain).range(options.domain_colors);
    } else {
      page_options.color = d3.scale.category20();
    }


    var color = page_options.color;

    svg.selectAll(".dot")
        .data(options.data)
      .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", options.circle_radius)
        .attr("cx", function(d){
          var xDomain;
          xDomain = d[options.xDomain];
          return graph.scaleX(xDomain);})
        .attr("cy", function(d){
          var yDomain;
          yDomain = d[options.yDomain];
          return graph.scaleY(yDomain);})
        .style("fill", function(d) {
          var groupByoption;
          groupByoption = d[options.groupByoption];
          return color(groupByoption);})
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);

    graph.svgForPCA = svg;
    return graph;
  };

setup_zoom = function(graph){
  var  svg = graph.svgForPCA;
  var options = graph.options;
  var page_options = graph.page_options;

  var zoom = d3.behavior.zoom()
      .x(graph.scaleX)
      .y(graph.scaleY)
      .on("zoom", function(){
        var x = d3.svg.axis()
             .scale(graph.scaleX)
             .orient("bottom");
        var y = d3.svg.axis()
             .scale(graph.scaleY)
             .orient("left");
        svg.select(".xAxis").call(x);
        svg.select(".yAxis").call(y);
        svg.selectAll(".dot")
          .attr("cx", function(d){
            var xDomain;
            xDomain = d[options.xDomain];
            return graph.scaleX(xDomain);})
          .attr("cy", function(d){
            var yDomain;
            yDomain = d[options.yDomain];
            return graph.scaleY(yDomain);});
      });


  svg.append("rect")
    .attr("width", page_options.width)
    .attr("height", page_options.height)
    .style("fill", "none")
    .style("pointer-events", "fill")
    .style("visibility", "hidden")
    .call(zoom);


  graph.svgForPCA = svg;
  return graph;
};

setup_brush = function(graph){
  var svg = graph.svgForPCA;
  var options = graph.options;
  var page_options = graph.page_options;

  var brush = d3.svg.brush()
       .x(graph.scaleX)
       .y(graph.scaleY)
       .on("brushend", function() {
         var x = graph.scaleX;
         var y = graph.scaleY;

         var extent = brush.extent(); //extent contains data of the brush area
         x.domain([extent[0][0], extent[1][0]]);
         y.domain([extent[0][1], extent[1][1]]);

         var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom");
         var yAxis = d3.svg.axis()
                      .scale(y)
                      .orient("left");

         svg.transition().duration(500)
           .select(".xAxis")
           .call(xAxis);

         svg.transition().duration(500)
           .select(".yAxis")
           .call(yAxis);

         svg.selectAll(".dot")
            .transition()
            .duration(500)
            .attr("cx", function(d) {
              var xDomain;
              xDomain = d[options.xDomain];
              return x(xDomain);
            })
            .attr("cy", function(d) {
              var yDomain;
              yDomain = d[options.yDomain];
              return y(yDomain);
            });

            d3.event.target.clear();
            d3.select(this).call(d3.event.target);
            //d3.selectAll(".brush").remove();
       });

  svg.append("g")
    .attr("class", "brush")
    .call(brush);

  graph.svgForPCA = svg;
  return graph;
};





  setup_legend = function(graph){
      var svg = graph.svgForPCA;
      var page_options = graph.page_options;
      var color = page_options.color;
      var width = page_options.width

      var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0,"+ i * 20 +")"; });

      legend.append("rect")
          .attr("x", width + 20)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width + 14)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

      graph.svgForPCA = svg;
      return graph;
  };

  setup_x_axis_for_bar_chart = function(graph){
    var page_options = graph.page_options;
    var svg = graph.svgForBar;
    var options = graph.options;
    var data = [];
    //only store the top components, number of components is decided by options.numberOfComponents
    for (var i = 0; i < options.numberOfComponents; i++) {
      data[i] = options.barChartData[i];
    }
    //setup the scale for x axis, this is a linear scale
    var barChartScaleX = d3.scale.ordinal()
        .rangeRoundBands([0,page_options.barChartWidth], .1);
    //setup domain
    barChartScaleX.domain(data.map(function(d) {return d.prcomp}));
    //setup xaxis
    var xAxis = d3.svg.axis()
        .scale(barChartScaleX)
        .orient("bottom");

    //append as a group
    svg.append("g")
        .attr("class", "barChartXAxis axis")
        .attr("transform", "translate(0," + page_options.barChartHeight +")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", page_options.barChartWidth)
        .attr("y", -6)
        .style("text-anchor", "end")
        //.text(options.x_axis_title);
    graph.svgForBar = svg;
    graph.barChartScaleX = barChartScaleX;
    return graph;
  };

  setup_y_axis_for_bar_chart = function(graph){
    var page_options = graph.page_options;
    var svg = graph.svgForBar;
    var options = graph.options;
    var data = [];

    //only store the top components, number of components is decided by options.numberOfComponents
    for (var i = 0; i < options.numberOfComponents; i++) {
      data[i] = options.barChartData[i];
    }
    //setup the scale for y axis, this is a linear scale
    var barChartScaleY = d3.scale.linear()
        .range([page_options.barChartHeight,0]);
    //setup domain
    barChartScaleY.domain([0, d3.max(data, function(d) { return d.eigenvalue;})]);
    //setup y axis
    var yAxis = d3.svg.axis()
        .scale(barChartScaleY)
        .orient("left");

    //append as a group
    svg.append("g")
        .attr("class", "barChartYAxis axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        //.text(options.y_axis_title);
    graph.svgForBar = svg;
    graph.barChartScaleY = barChartScaleY;
    graph.barChartYAxis = yAxis;
    return graph;
  };

  setup_bar = function(graph){
    var page_options = graph.page_options;
    var svg = graph.svgForBar;
    var options = graph.options;
    //var data = options.barChartData;
    var data = [];
    //only store the top components, number of components is decided by options.numberOfComponents
    for (var i = 0; i < options.numberOfComponents; i++) {
      data[i] = options.barChartData[i];
    }

    svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("clicked", "false")
      .attr("id", function(d) {return d.prcomp;})
      .attr("x", function(d) {return graph.barChartScaleX(d.prcomp); })
      .attr("y", function(d) {return graph.barChartScaleY(d.eigenvalue); })
      .attr("height", function(d) {return page_options.barChartHeight - graph.barChartScaleY(d.eigenvalue); })
      .attr("width", graph.barChartScaleX.rangeBand())
      .attr("fill", function(d) {
        var color;
        // if a bar is clicked, fill it with red
        if ((d.prcomp === options.clickedBars[0]) || (d.prcomp === options.clickedBars[1])) {
          color = "red";
        } else {
          color = "steelblue";
        }
        return color;
      });
    graph.svgForBar = svg;
    return graph;
  };



  setup_svg = function(graph){
    var options = graph.options;
    var page_options = graph.page_options;

    var left = page_options.margin.left,
        right = page_options.margin.right,
        top = page_options.margin.top,
        bottom = page_options.margin.bottom;

    var scatterWidth = options.width;
    var scatterHeight = options.height;
    var full_width = page_options.fullWidth;
    var full_height = page_options.fullHeight;
    // clear out html
    $(options.target)
            .html('')
            .css("width", full_width + "px" )
            .css("height", full_height + "px")

    // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
    // and inside the d3.tsv we get the data ready to go (called options.data here)
    var svgForPCA = d3.select(options.target).append("svg")
        .attr("width", scatterWidth)
        .attr("height",scatterHeight)
      .append("g")
        // this is just to move the picture down to the right margin length
        .attr("transform", "translate(" + left + "," + top + ")");

    /*
    The zoom function works in the whole svg area.
    If we put 2 plots in one svg element, we will find that the circles in the scatter plot can reach the bar chart area when zooming in.
    So, we use one svg for scatter plot, one svg for bar chart to make sure that the zoom function only works in the scatter plot.
    */
    var svgForBar = d3.select(options.target).append("svg")
        .attr("width", scatterWidth)
        .attr("height",options.barChartHeight)
      .append("g")
        // this is just to move the picture down to the right margin length
        .attr("transform", "translate(" + left + "," + top + ")");

    graph.svgForPCA = svgForPCA;
    graph.svgForBar = svgForBar;
    return graph;
  };


  setup_graph = function(graph){
    //setup all the graph elements
    graph = setup_margins(graph);
    graph = setup_svg(graph);
    graph = setup_x_axis(graph);
    graph = setup_y_axis(graph);
    //graph.toggleFlag = false;
    /*
    if you append your zoom/brush after your data points, the zoom/brush overlay will catch all of the pointer events,
    and your tooltips will disappear on hover.
    You want to append the zoom/brush before your data points, so that pointer events on the data generate a tooltip,
    and those on the overlay generate a zoom/brush.
    */
    var svg = graph.svgForPCA;
    svg.append("text")
      .attr("y", 0)
      .attr("x", 800)
      .attr("class", "brushButton")
      .attr("id", "notToggled")
      .text("Toggle Brush")
      .on("click", function(){
        graph = setup_brush(graph);
      });

      svg.append("text")
        .attr("y", 0)
        .attr("x", 700)
        .attr("class", "zoomButton")
        .attr("id", "notToggled")
        .text("Toggle Zoom")
        .on("click", function(){
          graph = setup_zoom(graph);
        });
    graph = setup_zoom(graph);

    graph = setup_scatter(graph);

    graph = setup_legend(graph);
    graph = setup_x_axis_for_bar_chart(graph);
    graph = setup_y_axis_for_bar_chart(graph);
    graph = setup_bar(graph);

    graph.svgForPCA = svg;
    return graph
  };

  init = function(init_options){
      var options = default_options();
      options = init_options;
      page_options = {}; // was new Object() but jshint wanted me to change this
      var graph = {}; // this is a new object
      graph.options = options;
      graph = setup_graph(graph);
      var target = $(options.target);
      target.addClass('scatter_plot');
      svgForPCA = graph.svgForPCA;
      svgForBar = graph.svgForBar;
  } ;
  // constructor to run right at the start
  init(init_options);

};

/**
 * Private Methods
 */

/*
 * Public Methods
 */
