// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-vis-pca");

//colorBy contains different color options
var colorBy = {SampleType: ["0", "Day1", "Day2","Day3", "Day4", "Day5", "Day6", "Day7", "ESRP KD", "CTRL", "RBM47 KD"], ExperimentalSeries: ["PRJNA304414", "PRJNA304419", "PRJNA304418"]};

var colors = ["DarkOrchid", "Orange", "DodgerBlue", "Blue","BlueViolet","Brown", "Deeppink", "BurlyWood","CadetBlue",
"Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan", "Red", "DarkBlue"];

//set default values for color domain, xDomain, yDomain and colorOption
var colorDomain = colorBy.SampleType;
var xDomain = "PC1"; //xDomain is used to setup the domain for x axis and circle's cx attribute in scatter_plot
var yDomain = "PC2"; //yDomain is used to setup the domain for y axis and circle's cy attribute in scatter_plot
var colorOption = "SampleType";

//store the data for bar chart
var barChartData;

//store the metadata which is used to decide how the points are colored
var metaDataForSampleId;

// number of components that will be displayed in bar chart
var numberOfComponents = 5;

//number of bars that are clicked
var numOfClickedBars = 0;

//store the clicked bars' ids
var clickedBarId = [];

var body = document.getElementsByTagName("body")[0];

//Create array of color options to be added
var colorOptions = ["SampleType", "ExperimentalSeries"];

//Create and append select list for color options
var colorSelectList = document.createElement("select");
colorSelectList.id = "colorSelect";
colorSelectList.onchange = function(){if (typeof(this.selectedIndex) != 'undefined')
                                {
                                  color_by_option(this.selectedIndex);
                                }
};
body.appendChild(colorSelectList);

//Create and append the color options
for (var i = 0; i < colorOptions.length; i++) {
    var option = document.createElement("option");
    option.value = colorOptions[i];
    option.text = colorOptions[i];
    option.id = colorOptions[i];
    if (i === 0) {
      option.defaultSelected = true;
    }

    colorSelectList.appendChild(option);
}

//create and append the reset button

var resetButton = document.createElement("button");
resetButton.innerHTML = "Reset";

/*
when click the reset button, first reset the variables, then re-draw the graph.
*/
resetButton.onclick = function(){
  numOfClickedBars = 0;
  clickedBarId = [];
  xDomain = "PC1";
  yDomain = "PC2";
  colorOption = "SampleType";
  colorDomain = colorBy.SampleType;
  default_graph();
  colorSelectList.options[0].selected = true; //reset the select list

};
body.appendChild(resetButton);




var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, +110])
    .html(function(d){
        sampleID = d.SampleID;
        component1 = d[xDomain];
        component2 = d[yDomain];
        temp = "SampleID: " + sampleID + "<br/>" +
               component1 + ", " + component2
        return temp;
    });

//load the bar chart data
d3.tsv("../data/PCA_transcript_expression_TMM_RPKM_log2_screetable_prcomp_variance.6932.tsv", function(error, data) {
    data.forEach(function(d) {
      d.eigenvalue = +d.eigenvalue;
    });
    barChartData = data;
});

//load the metadara for color options
d3.tsv("../data/6932_metadata.tsv", function(error, data) {
    metaDataForSampleId = data;
});

default_graph();
// render the default graph, use SampleType as color domain
function default_graph(){
d3.tsv("../data/PCA_transcript_expression_TMM_RPKM_log2_sample_data.6932.tsv", function(error, data) {
      data.forEach(function(d) {
        d.PC1 = +d.PC1;
        d.PC2 = +d.PC2;
      });

      target = rootDiv;
      var options = {
        clickedBars: clickedBarId,
        numberOfComponents: numberOfComponents,  //used to determine how many components will be showed in the bar chart
        barChartData: barChartData,
        barChartHeight:900,
        barChartWidth: numberOfComponents * 30,
        colorOption: colorOption,
        xDomain: "PC1",
        yDomain: "PC2",
        circle_radius: 8,
        data: data,
        height: 500,
        width: 960,
        colorDomain: colorBy.SampleType, //this is the domain for color scale
        domain_colors: colors, //this is the colors used to for different color options
        margin: {
          top: 10,
          right: 20,
          bottom: 10,
          left: 40
        },
        target: target,
        tooltip: tooltip,
        x_axis_title: "PC1",
        y_axis_title: "PC2",
      };

      //merge each SampleID's metadata to its raw data
       for (var i = 0; i < data.length; i++) {
         jQuery.extend(options.data[i],metaDataForSampleId[i]);
       }

      var instance = new app(options);

      // Get the d3js SVG element
      var tmp = document.getElementById(rootDiv.id);
      var svg = tmp.getElementsByTagName("svg")[0];

      // Extract the data as SVG text string
      var svg_xml = (new XMLSerializer).serializeToString(svg);

      var bars = d3.selectAll(".bar")
                  .on("click",function(d,i){
                      var clicked = this.getAttribute("clicked");
                      var id = this.getAttribute("id");

                      if (numOfClickedBars < 2) {
                        if (clicked === "false") {
                          d3.select(this)
                          .attr("clicked", "true")
                          .attr("fill", "red");
                          numOfClickedBars = numOfClickedBars + 1;
                          clickedBarId.push(id);
                        }

                        if (numOfClickedBars === 2) {
                          choose_components();
                        }
                      }
                  });
});
}
//re-render the graph according to the color option
function color_by_option(index){
  var chosenOption = colorSelectList.options[index];

  if (chosenOption.selected === true) {
    if (chosenOption.id === "SampleType") {
      colorDomain = colorBy.SampleType;
      colorOption = "SampleType";
    }

    if (chosenOption.id === "ExperimentalSeries") {
      colorDomain = colorBy.ExperimentalSeries;
      colorOption = "ExperimentalSeries";
    }
  }
  // each time the option is changed, we need to read the file and redener the svg again.
  d3.tsv("../data/PCA_transcript_expression_TMM_RPKM_log2_sample_data.6932.tsv", function(error, data) {
    data.forEach(function(d) {
      d[xDomain] = +d[xDomain];
      d[yDomain] = +d[yDomain];
    });

    target = rootDiv;
    var options = {
      clickedBars: clickedBarId,
      numberOfComponents: numberOfComponents,  //used to determine how many components will be showed in the bar chart
      barChartData: barChartData,
      barChartHeight:900,
      barChartWidth: numberOfComponents * 30,
      colorOption: colorOption,
      xDomain: xDomain,
      yDomain: yDomain,
      circle_radius: 8,
      data: data,
      height: 500,
      width: 960,
      colorDomain: colorDomain, //this is the domain for color scale
      domain_colors: colors,
      margin: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 40
      },
      target: target,
      tooltip: tooltip,
      x_axis_title: xDomain,
      y_axis_title: yDomain,
    };

    for (var i = 0; i < data.length; i++) {
      jQuery.extend(options.data[i],metaDataForSampleId[i]);
    }

    var instance = new app(options);

    // Get the d3js SVG element
    var tmp = document.getElementById(rootDiv.id);
    var svg = tmp.getElementsByTagName("svg")[0];

    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);

    var bars = d3.selectAll(".bar")
                .on("click",function(d,i){
                    var clicked = this.getAttribute("clicked");
                    var id = this.getAttribute("id");

                    if (numOfClickedBars < 2) {
                      if (clicked === "false") {
                        d3.select(this)
                        .attr("clicked", "true")
                        .attr("fill", "red");
                        numOfClickedBars = numOfClickedBars + 1;
                        clickedBarId.push(id);
                      }

                      if (numOfClickedBars === 2) {
                        choose_components();
                      }
                    }
                });

  });
}

//re-render the graph according to the chosen components
function choose_components(){
   xDomain = clickedBarId[0];
   yDomain = clickedBarId[1];

  // each time the option is changed, we need to read the file and redener the svg again.
  d3.tsv("../data/PCA_transcript_expression_TMM_RPKM_log2_sample_data.6932.tsv", function(error, data) {
    data.forEach(function(d) {
      d[xDomain] = +d[xDomain];
      d[yDomain] = +d[yDomain];
    });

    target = rootDiv;
    var options = {
      clickedBars: clickedBarId,
      numberOfComponents: numberOfComponents,  //used to determine how many components will be showed in the bar chart
      barChartData: barChartData,
      barChartHeight:900,
      barChartWidth: numberOfComponents * 30,
      colorOption: colorOption,
      xDomain: xDomain,
      yDomain: yDomain,
      circle_radius: 8,
      data: data,
      height: 500,
      width: 960,
      colorDomain: colorDomain, //this is the domain for color scale
      domain_colors: colors,
      margin: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 40
      },
      target: target,
      tooltip: tooltip,
      x_axis_title: xDomain,
      y_axis_title: yDomain,
    };

    for (var i = 0; i < data.length; i++) {
      jQuery.extend(options.data[i],metaDataForSampleId[i]);
    }


    var instance = new app(options);

    // Get the d3js SVG element
    var tmp = document.getElementById(rootDiv.id);
    var svg = tmp.getElementsByTagName("svg")[0];

    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);

    var bars = d3.selectAll(".bar")
                .on("click",function(d,i){
                    if (numOfClickedBars >= 2) {
                      alert("Two components have been chosen, please reset")
                    }
                });
  });
}
