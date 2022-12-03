function drawStreamOverview() {
  updateGlobalData();
  updateTweetCountData();

  var height = 60;

  var final_data = []

  var keys = ["Valence Disgust", "Valence Sadness", "Valence Surprise", "Valence Fear", "Valence Trust", "Valence Joy", "Valence Anticipation", "Valence Anger"]

  for (var i = 0; i < data_global.length; i++) {
    var map = {}
    var total = 0;

    for (var j = 0; j < keys.length; j++) {
      total = total + parseFloat(data_global[i][keys[j]]);
    }

    var val_avg = total / keys.length;
    map["valence_average"] = val_avg;

    array_start = data_global[i]["Start Date"].split("/")
    array_end = data_global[i]["End Date"].split("/")

    map["Start Date"] = array_start[0] + "-" + monthNames[parseInt(array_start[1]) - 1] + "-" + array_start[2]
    map["End Date"] = array_end[0] + "-" + monthNames[parseInt(array_end[1]) - 1] + "-" + array_end[2]

    final_data.push(map);

  }

  y = d3.scaleLinear()
    .domain([-1, 1])
    .range([height, 0]);

  x = d3.scaleTime()
    .domain(d3.extent(data_stream_global, function (d) {
      return getDateFromString(d["Date"]);
    }))
    .range([0, widthPlease]);

  var x_axis = d3.axisBottom().scale(x);
  var y_axis = d3.axisLeft().scale(y).tickValues([]);;

  var svg = d3.select("#streamOvrGraph");

  var gEl = svg.append("g")
    .attr("transform", "translate(80, 40)");

  gEl.append("g")
    .attr("id", "overviewYAxis")
    .call(y_axis);

  gEl.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("id", "overviewXAxis")
    .call(x_axis);

  var maxTweetCount = 0;
  for (var i = 0; i < tweet_count_data.length; i++) {
    maxTweetCount = Math.max(maxTweetCount, tweet_count_data[i]["Count"]);
  }

  const clip = svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", widthPlease)
    .attr("height", heightPlease)
    .attr("x", 0)
    .attr("y", 0)
  //  .attr("transform", "translate(0," + height + ")");

  // Add brushing
  brush = d3.brushX()                   // Add the brush feature using the d3.brush function
    .extent([[0, 0], [1000, 100]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart)

  var y2 = d3.scaleLinear()
    .domain([0, maxTweetCount])
    .range([height, 10]);

  svg.append("path")
    .datum(tweet_count_data)
    .attr("fill", "#4682B4")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5)
    .attr("d", d3.area()
      .curve(d3.curveMonotoneX)
      .x(function (d) { return x(getDateFromString(d["Start Date"])) })
      .y0(y2(0))
      .y1(function (d) { return y2(d["Count"]) })
    )
    .attr("transform", "translate(80, 40)");

  svg.append("path")
    .datum(final_data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function (d) { return x(getDateFromString(d["Start Date"])) })
      .y(function (d) { return y(d["valence_average"]) })
    )
    .attr("transform", "translate(80, 40)");

  svg.selectAll(".circle")
    .data(final_data)
    .enter()
    .append("circle")
    .attr("r", 3.5)
    .attr("cx", function (d) {
      return x(getDateFromString(d["Start Date"]))
    })
    .attr("cy", function (d) {
      return y(d["valence_average"])
    })
    .attr("fill", "white")
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr("transform", "translate(80, 40)");

    svg.selectAll("whatever")
    .data(final_data)
    .enter()
    .append("line")
    .style("stroke", "red")
    .attr("class",function (d){ return "upper_line_remove upper_line_remove_" + d["Start Date"]})
    .style("stroke-width", 0.5)
    .attr("x1", (d) => x(getDateFromString(d["Start Date"])))
    .attr("y1", y(-1))
    .attr("x2", (d) => x(getDateFromString(d["Start Date"])))
    .attr("y2", y(1))
    .attr("transform", "translate(80, 40)")
    .attr("visibility", "hidden");

  svg
    .append("g")
    .attr("class", "brush")
    .attr("transform", "translate(80, 40)")
    .call(brush);
}