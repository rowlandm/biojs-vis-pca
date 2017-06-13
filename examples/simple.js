// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-vis-pca");

//metaData contains different options
var metaData = {"Candidate": ["Candidate", "Non-Candidate"]};

//set default values for color domain, xDomain, yDomain and colorOption
var colorDomain = metaData.Candidate;
var colorOption = "Candidate";

var body = document.getElementsByTagName("body")[0];

xDomain = "x_value";
yDomain = "y_value";

var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, +110])
    .html(function(d){
        name = d.Protein_Name;
        id = d.Unique_ID;
        candidate = d.Candidate;
        component1 = d[xDomain];
        component2 = d[yDomain];
        temp = "Protein: " + name + " (" + id + ") <br/>" +
               "-Log10 Q Value: " + component1 + " <br/> " + 
               "Log 2 Fold Change: " + component2;
        return temp;
    });

// render the default graph, use option1 as domain
d3.tsv("../data/volcano_demo.tsv", function(error, data) {
      data.forEach(function(d) {
        d.x_value = +d.Log2_Fold_Change;
        d.y_value = +d.Neg_Log_10_Q_Value;
      });

      target = rootDiv;
      var options = {
        colorOption: colorOption,
        xDomain: xDomain,
        yDomain: yDomain,
        metaData: metaData,
        circle_radius: 3,
        data: data,
        height: 600,
        width: 960,
        colorDomain: metaData.Candidate, //this is the domain for color scale
        domain_colors: ["red", "grey"],
        margin: {
          top: 80,
          right: 20,
          bottom: 30,
          left: 40
        },
        target: target,
        tooltip: tooltip,
        x_axis_title: "Log2 Fold Change",
        y_axis_title: "- Log 10 Q value",
      };

      var instance = new app(options);

      // Get the d3js SVG element
      var tmp = document.getElementById(rootDiv.id);
      var svg = tmp.getElementsByTagName("svg")[0];

      // Extract the data as SVG text string
      var svg_xml = (new XMLSerializer).serializeToString(svg);
});


