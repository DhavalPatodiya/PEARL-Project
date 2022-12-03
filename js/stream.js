
function getDateFromString(dateStr) {
  var day = parseInt(dateStr.substring(0, 2));
  var month = dateStr.substring(3, 6);
  var year = parseInt(dateStr.substring(7));
  var monthNum;

  for (var it = 0; it < monthNames.length; it++) {
    if (monthNames[it] == month) {
      monthNum = it;
      break;
    }
  }

  return new Date(year, monthNum, day);
}

function showTooltipTweets(f, d, e, div) {
  e = e || 20;
  var c = div_tweets;
  div_tweets
    .style("opacity", 1)
    .style("left", (f[0] + 10) + "px")
    .style("top", (f[1] - 15) + "px");
}

const mouseoverTweets = function (event, d) {
  chartgroup.selectAll(".myYaxis2").remove();
  chartgroup.selectAll(".yLabel2").remove();
  chartgroup.selectAll(".hoverline").remove();
  chartgroup.selectAll(".hoverLineText").remove();
  chartgroup.selectAll(".wordcloud").remove();

  chartgroup.append("g").attr("class", "myYaxis2")
    .attr("transform", "translate(" + widthPlease + ",0)")
    .call(d3.axisLeft().scale(streamyaxis2));

  chartgroup
    .append("text")
    .attr("class", "yLabel2")
    .attr("text-anchor", "end")
    .attr("y", widthPlease + 50)
    .attr("dy", ".75em")
    .attr("x", - heightPlease / 2)
    .attr("transform", "rotate(-90)")
    .attr("opacity", 1)
    .text("Tweets");

  showTooltipTweets([event.pageX, event.pageY], j(d), 20, div_tweets);

  chartgroup.append("line")
    .style("stroke", "red")
    .attr("class", "hoverline")
    .style("stroke-width", 1)
    .attr("x1", streamxaxis(getDateFromString(d["Start Date"])))
    .attr("y1", streamyaxis2(0))
    .attr("x2", streamxaxis(getDateFromString(d["Start Date"])))
    .attr("y2", streamyaxis2(maxTweetCount));

  chartgroup.append("text")
    .style("stroke", "black")
    .attr("opacity", 0.5)
    .attr("class", "hoverLineText")
    .attr("x", streamxaxis(getDateFromString(d["Start Date"])))
    .attr("y", streamyaxis2(2))
    .text(d["Start Date"]);


  function j(m) {
    var l =
      div_tweets.append("svg").attr("class", "wordcloud")
        .attr("width", 300).attr("height", 240)
        .style("background-color", "lightyellow").style("border-radius", "20px").style("box-shadow", "5px 5px 2px lightgrey");

    var myWords = d["Trigger Words"].replace(/'/g, '"');
    myWords = JSON.parse(myWords);
    var temp_dict = count_dictionary[d["Start Date"]];
    d3.layout.cloud().size([300, 240]).words(myWords.map(function (n) {
      return {
        text: n,
        size: temp_dict[n] * 10
      }
    })).padding(2).rotate(0).font("sans-serif").fontSize(function (n) {
      return n.size
    }).on("end", k).start();

    function k(n) {
      l.append("g").attr("transform", "translate(150,120)").selectAll("text").data(n).enter().append("text").style("font-size", function (o) {
        return o.size + "px";
      }).style("font-family", "sans-serif").style("fill", "black").attr("text-anchor", "middle").attr("transform", function (o) {
        return "translate(" + [o.x, o.y] + ")"
      }).text(function (o) {
        return o.text
      })
    }
    return div_tweets
  }

}

const mousemoveTweets = function handleMouseMove(event, data) {
  const currentXPosition = d3.pointer(event)[0];
  const xValue = streamxaxis.invert(currentXPosition);
  const bisectDate = d3.bisector(d => getDateFromString(d["Start Date"])).left;
  const dataIndex = bisectDate(data, xValue, 1);
  const leftData = data[dataIndex - 1];
  mouseoverTweets(event, leftData);
  const rightData = data[dataIndex];
  var widthEntireGraph = document.getElementsByClassName('tweetCountGraph')[0].getBoundingClientRect().width;
  var new_x = x.range([0, widthEntireGraph]);
  const x1Percentage = new_x(getDateFromString(leftData["Start Date"])) / widthEntireGraph * 100;
  const x2Percentage = new_x(getDateFromString(rightData["Start Date"])) / widthEntireGraph * 100;
  d3.selectAll(".start").attr("offset", `${x1Percentage}%`);
  d3.selectAll(".end").attr("offset", `${x2Percentage}%`);
}

const mouseleaveTweets = function (event, d) {
  const gradientResetPercentage = "50%";
  chartgroup.selectAll(".myYaxis2").remove();
  chartgroup.selectAll(".yLabel2").remove();
  chartgroup.selectAll(".hoverline").remove();
  chartgroup.selectAll(".hoverLineText").remove();
  chartgroup.selectAll(".wordcloud").remove();
  d3.selectAll(".start").attr("offset", gradientResetPercentage);
  d3.selectAll(".end").attr("offset", gradientResetPercentage);
  div_tweets.html("");
  div_tweets.style("opacity", 0);
}

const mouseclickTweets = function handleMouseClick(event, data) {
  const currentXPosition = d3.pointer(event)[0];
  const xValue = streamxaxis.invert(currentXPosition);
  const bisectDate = d3.bisector(d => getDateFromString(d["Start Date"])).left;
  const dataIndex = bisectDate(data, xValue, 1);
  var entry_current = data_global[dataIndex - 1]
  displaytweets(entry_current)
  var date_current = entry_current["Start Date"].split("/")
  var data_current_format = date_current[0] + "-" + monthNames[+date_current[1] - 1] + "-" + date_current[2]

  d3.selectAll(".line_remove").style("stroke-width", "1px").attr("visibility", "hidden")
  d3.selectAll(".upper_line_remove").style("stroke-width", "1px").attr("visibility", "hidden")
  d3.select(".line_remove_" + data_current_format).style("stroke-width", "2px").attr("visibility", "visible")
  d3.select(".upper_line_remove_" + data_current_format).style("stroke-width", "2px").attr("visibility", "visible")

}
function occurrences(string, subString, allowOverlapping) {
  
  string += "";
  subString += "";
  if (subString.length <= 0) return (string.length + 1);

  var n = 0,
      pos = 0,
      step = allowOverlapping ? 1 : subString.length;

  while (true) {
      pos = string.indexOf(subString, pos);
      if (pos >= 0) {
          ++n;
          pos += step;
      } else break;
  }
  return n;
}

function drawAreaGraph(chartgroup, x) {

  barsOpacity = [];
  for (var i = 0; i < tweet_input.length; i++) {
    barsOpacity.push(0);
  }




  const defs = chartgroup.append("defs");
  const gradient = defs.append("linearGradient").attr("id", "svgGradient");
  const gradientResetPercentage = "50%";
  gradient
    .append("stop")
    .attr("class", "start")
    .attr("offset", gradientResetPercentage)
    .attr("stop-color", "lightblue");
  gradient
    .append("stop")
    .attr("class", "start")
    .attr("offset", gradientResetPercentage)
    .attr("stop-color", "black");
  gradient
    .append("stop")
    .attr("class", "end")
    .attr("offset", gradientResetPercentage)
    .attr("stop-color", "black")
    .attr("stop-opacity", 1);
  gradient
    .append("stop")
    .attr("class", "end")
    .attr("offset", gradientResetPercentage)
    .attr("stop-color", "lightblue");

  div_tweets = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);;
  maxTweetCount = 0;
  for (var i = 0; i < tweet_count_data.length; i++) 
  {
    var twigger_words = tweet_count_data[i]["Trigger Words"].replaceAll("'", "").replaceAll("[", "").replaceAll("]", "").replaceAll(" ", "").split(",")
    // console.log(tweet_count_data[i])
    var count_dictionary_inner = {};

    for (var j = 0; j < twigger_words.length; j++) {
      if (twigger_words[j] != "") 
      {

        var count = occurrences(tweet_count_data[i]["All Sentences"],twigger_words[j])
        if (count != 0) 
        {
          count_dictionary_inner[twigger_words[j]] = count;
        }
        
      }
    }
    count_dictionary[tweet_count_data[i]["Start Date"]] = count_dictionary_inner;
    maxTweetCount = Math.max(maxTweetCount, tweet_count_data[i]["Count"]);
  }

  // console.log(count_dictionary);

  var y2 = d3.scaleLinear()
    .domain([0, maxTweetCount])
    .range([heightPlease, 50]);

  streamyaxis2 = y2;


  chartgroup.append("path")
    .datum(tweet_count_data)
    .style("fill", "url(#svgGradient)")
    .attr("class", "tweetCountGraph")
    .attr("clip-path", "url(#clip)")
    .attr("opacity", 0.5)
    .attr("d", d3.area()
      .curve(d3.curveMonotoneX)
      .x(function (d) { return x(getDateFromString(d["Start Date"])) })
      .y0(y2(0))
      .y1(function (d) { return y2(d["Count"]) })
    ).on("mouseover", mousemoveTweets)
    .on("mouseout", mouseleaveTweets)
    .on("click", mouseclickTweets);
}

function updateChart(event, d) {

  // What are the selected boundaries?
  extent = event.selection;
  // console.log("extent", extent);
  var svg = d3.select("#streamOvrGraph");
  // If no selection, back to initial coordinate. Otherwise, update X axis domain
  if (!extent) {
    if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
  } else {
    streamxaxis.domain([x.invert(extent[0]), x.invert(extent[1])]);
    streamyaxis.domain([-1, 1]);
    // svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
  }

  const msvg = d3.select("#graph_svg");


  chartgroup.select(".myXaxis")
    .transition().duration(1000)
    .call(d3.axisBottom(streamxaxis));
  


  newArea = d3.area()
    .x(function (d) {
      var current = getDateFromString(d.data["Start Date"]);
      return streamxaxis(current);
    })
    .y0(function (d) { return streamyaxis(d[0]); })
    .y1(function (d) { return streamyaxis(d[1]); })
    .curve(d3.curveBasis)

  chartgroup.selectAll(".myArea")
    .data(dstackedData)
    .transition().duration(1000)
    .attr("d", newArea);

  var newArea2 = d3.area()
    .x(function (d) {
      var current = getDateFromString(d["Start Date"]);
      return streamxaxis(current);
    })
    .y0(function (d) { return streamyaxis2(0); })
    .y1(function (d) { return streamyaxis2(d["Count"]); })
    .curve(d3.curveMonotoneX)

  chartgroup.selectAll(".tweetCountGraph")
    .datum(tweet_count_data)
    .transition().duration(1000)
    .attr("d", newArea2);

  chartgroup.selectAll(".tweetCountGraph")
    .on("mouseover", mousemoveTweets)
    .on("mouseout", mouseleaveTweets)
  // .on("click",mouseclickTweets);

  chartgroup.selectAll(".myCircle")
    .data(filtered_data_stream_global)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return streamxaxis(getDateFromString(d["Start Date"]));
    })
    .attr("cy", function (d) {
      thing = valence_averages[d["Count"]]
      return streamyaxis(thing)
    })

  chartgroup.selectAll(".line")
    .data(filtered_data_stream_global)
    .transition().duration(1000)
    .attr("x", function (d) {
      return streamxaxis(getDateFromString(d["Start Date"])) - 4
    })
    .attr("y", function (d) {
      thing = valence_averages[d["Count"]]
      return streamyaxis(thing) + 3
    }).attr("transform", function (d) {
      x_var = streamxaxis(getDateFromString(d["Start Date"]));
      y_var = streamyaxis(valence_averages[d["Count"]]);

      array = 0
      high = 0

      var currentData = data_global[d["Count"]]


      for (var i = 0; i < keys_dominance.length; i++) {

        if (currentData[keys_dominance[i]] > high) {
          high = currentData[keys_dominance[i]]
          array = i
        }
      }
      angle = (90 / 8) * array - 45
      return "rotate(" + angle + "," + x_var + "," + y_var + ")";
    })


  chartgroup.selectAll(".hiddenc")
    .data(filtered_data_stream_global)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return streamxaxis(getDateFromString(d["Start Date"]));
    })
    .attr("cy", function (d) {
      thing = valence_averages[d["Count"]]
      return streamyaxis(thing)
    })

  var cnt = 0;

  for (var j = 0; j < updated_valences.length; j++) {
    var entry = updated_valences[j]

    if (skipped_count.includes(+entry["Count"])) { continue; }

    chartgroup.selectAll(".line_remove_" + entry["Start Date"])
      .transition().duration(1000)
      .attr("x1", streamxaxis(getDateFromString(entry["Start Date"])))
      .attr("y1", streamyaxis(1))
      .attr("x2", streamxaxis(getDateFromString(entry["Start Date"])))
      .attr("y2", streamyaxis(-1));

    data_packing = data_packing_array[cnt];

    x_offset = streamxaxis(getDateFromString(entry["Start Date"]))
    y_offset = streamyaxis(valence_averages[j])

    chartgroup.selectAll(".temp_remove_" + entry["Start Date"])
      .data(data_packing)
      .transition().duration(1000)
      .attr('cx', d => x_offset + d.x)
      .attr('cy', d => y_offset + d.y);

    chartgroup.selectAll(".hidden_line_" + j)
      .data(data_packing)
      .transition().duration(1000)
      .attr("x", d => x_offset + d.x - 4)
      .attr("y", d => y_offset + d.y + 3)
      .attr("transform", function (d) {
        x_var = x_offset + d.x;
        y_var = y_offset + d.y;

        array = 0
        high = 0
        current_key = d.key.replace("Intensity", "Dominance")
        var currentData = data_global[j]
        array = currentData[current_key]
        angle = (90) * array - 45
        return "rotate(" + angle + "," + x_var + "," + y_var + ")";
      })
    cnt++;
  }

  chartgroup.selectAll(".linenr")
    .transition().duration(1000)
    .attr("x1", streamxaxis(getDateFromString(updated_valences[0]["Date"])))
    .attr("y1", streamyaxis(0))
    .attr("x2", streamxaxis(getDateFromString(updated_valences[updated_valences.length - 1]["Date"])))
    .attr("y2", streamyaxis(0));

}

document.addEventListener(
  "DOMContentLoaded",
  (function () {

    Promise.all([d3.dsv(",", "data/data.csv"),
    d3.dsv(",", "data/segmented_parameters_rihanna.csv"),
    d3.dsv(",", "data/segmented_parameters_oprah.csv"),
    d3.dsv(",", "data/segmented_parameters_obama.csv"),
    d3.dsv(",", "data/segmented_parameters_gates.csv"),
    d3.dsv(",", "data/segmented_parameters_falon.csv"),
    d3.dsv(",", "data/tweet_triggers_timestamps_rihanna.csv"),
    d3.dsv(",", "data/tweet_triggers_timestamps_oprah.csv"),
    d3.dsv(",", "data/tweet_triggers_timestamps_obama.csv"),
    d3.dsv(",", "data/tweet_triggers_timestamps_gates.csv"),
    d3.dsv(",", "data/tweet_triggers_timestamps_falon.csv"),
    d3.dsv(",", "Preprocessing/ANEWLexicon.csv"),
    d3.dsv(",", "Preprocessing/NRCLexicon_with_heading.csv")

    ]).then(function (
      values
    ) {
      console.log("Data Successfully Loaded");
      segmented_parameters_rihanna = values[1];
      segmented_parameters_oprah = values[2];
      segmented_parameters_obama = values[3];
      segmented_parameters_gates = values[4];
      segmented_parameters_falon = values[5];
      tweet_triggers_timestamps_rihanna = values[6];
      tweet_triggers_timestamps_oprah = values[7];
      tweet_triggers_timestamps_obama = values[8];
      tweet_triggers_timestamps_gates = values[9];
      tweet_triggers_timestamps_falon = values[10];
      anew_lexicon = values[11];
      nrc_lexicon = values[12];

      calculateWordsMapping();
      draw();
      drawextension();
      drawStreamOverview();
    });
  })()
);

function draw() {
  // get the svg element
  updateGlobalData();
  updateTweetCountData();

  var svg = d3.select("#graph_svg");

  var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("id", "clip-rect")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", widthPlease)
    .attr("height", heightPlease);

  // create a chart group
  chartgroup = svg.append("g")
    .attr("transform", "translate(80, 40)");

  // create a scale for the x axis
  var date_min = new Date("01-Dec-18");
  var date_max = new Date("01-Feb-20");

  trial(chartgroup);
}

function data_processing(chartgroup) {

}

function trial(chartgroup) {

  var keys = data_global.columns.slice(1)
  const data_unchanged_global = data_global;


  var keys = ["Valence Disgust", "Valence Sadness", "Valence Surprise", "Valence Fear", "Valence Trust", "Valence Joy", "Valence Anticipation", "Valence Anger"]
  keys_checkbox = ["disgust", "sadness", "surprise", "fear", "trust", "joy", "anticipation", "anger"]

  var keys_intensity = ["Intensity Disgust", "Intensity Sadness", "Intensity Surprise", "Intensity Fear", "Intensity Trust", "Intensity Joy", "Intensity Anticipation", "Intensity Anger"]
  data_user = data_global
  data_stream = {}
  valence_averages = []
  intensity_percentages = []

  min = Infinity
  max = -Infinity

  for (var i = 0; i < data_user.length; i++) {
    key = i

    for (var j = 0; j < keys.length; j++) {
      if (data_user[i][keys[j]] < min) {
        min = data_user[i][keys[j]]
      }
      if (data_user[i][keys[j]] > max) {
        max = data_user[i][keys[j]]
      }
    }


  }

  var scaling_things = max * 3
  var addCount = 1;

  for (var i = 0; i < data_user.length; i++) {
    key = i
    value = {}

    var total = 0;
    var percentageMap = {};

    for (var j = 0; j < keys.length; j++) {
      value[keys[j]] = data_user[i][keys[j]] / scaling_things
      total = total + parseFloat(data_user[i][keys[j]]);
    }

    var val_avg = total / keys.length;
    valence_averages.push(val_avg);
    var total_intensity = 0;

    for (var j = 0; j < keys_intensity.length; j++) {
      value[keys_intensity[j]] = data_user[i][keys_intensity[j]];
      total_intensity = total_intensity + parseFloat(data_user[i][keys_intensity[j]]);
    }
    for (var j = 0; j < keys_intensity.length; j++) {
      percentageMap[keys_intensity[j]] = parseFloat(data_user[i][keys_intensity[j]]) / total_intensity;
    }
    if (total_intensity == 0) {
      if (i > 0 && addCount == 1) {
        intensity_percentages.push(intensity_percentages[i - 1]);
        addCount = 1;
      }
      else
        addCount++;
    } else {
      for (var itr = 0; itr < addCount; itr++) {
        intensity_percentages.push(percentageMap);
      }
      addCount = 1;
    }

    array_start = data_user[i]["Start Date"].split("/")
    array_end = data_user[i]["End Date"].split("/")

    value["Start Date"] = array_start[0] + "-" + monthNames[parseInt(array_start[1]) - 1] + "-" + array_start[2]
    value["End Date"] = array_end[0] + "-" + monthNames[parseInt(array_end[1]) - 1] + "-" + array_end[2]
    value["Count"] = i
    data_stream[key] = value;
  }

  data_thing = []

  var start_date = new Date(data_stream[0]["Start Date"])
  for (var i = 0; i < Object.keys(data_stream).length; i++) {

    data_stream[i]["Date"] = data_stream[i]["Start Date"]
    data_thing.push(data_stream[i])
    
  }

  data_stream_global = data_thing;

  y = d3.scaleLinear()
    .domain([-1, 1])
    .range([heightPlease, 0]);

  streamyaxis = y;
  var width = 0.5;

  updated_valences = [];

  for (var it = 0; it < intensity_percentages.length; it++) {

    percentageMap = intensity_percentages[it];
    var newPercentage = {}
    for (var i = 0; i < keys_intensity.length; i++) {
      var val = 0;
      if (!isNaN(percentageMap[keys_intensity[i]])) {
        val = percentageMap[keys_intensity[i]];
      }
      newPercentage[keys[i]] = val * width;
    }
    newPercentage["Start Date"] = data_thing[it]["Start Date"];
    newPercentage["End Date"] = data_thing[it]["End Date"];
    newPercentage["Date"] = data_thing[it]["Date"];
    newPercentage["Count"] = data_thing[it]["Count"];

    updated_valences.push(newPercentage);
  }

  const stackedData = d3.stack()
    .offset(function (series, order) {
      if (!((n = series.length) > 0)) return;
      for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
        for (var i = 0, y = 0; i < n; ++i) {
          y += series[i][j][1] || 0;
        }
        s0[j][1] += s0[j][0] = (-y / 2) + valence_averages[j];
      }
      d3.stackOffsetNone(series, order);
    }).keys(keys)(updated_valences)

  dstackedData = stackedData
  display_valences = updated_valences
  
  var x = d3.scaleTime()
    .domain(d3.extent(data_thing, function (d) {
      return getDateFromString(d["Date"]);
    }))
    .range([0, widthPlease]);

  streamxaxis = x;

  var x_axis = d3.axisBottom().scale(x);
  var y_axis = d3.axisLeft().scale(y);

  // if index is 0, then we are not printing it on the graph
  x_axis.tickFormat((d, index) => {
    if (d.getMonth() === 0) {
      return d3.timeFormat("%Y")(d);;
    } else {
      return formatMonthPlease(d);
    }
  });

  var div = d3.select("body").append("div")
    .attr("class", "test")
    .style("opacity", 0);

  // draw the axes
  chartgroup.append("g").attr("class", "myYaxis").call(y_axis);
  chartgroup
    .append("g")
    .attr("transform", "translate(0," + heightPlease + ")")
    .attr("class", "myXaxis")
    .call(x_axis);

  // create the text for the y axis
  chartgroup
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -50)
    .attr("dy", ".75em")
    .attr("x", -heightPlease / 2)
    .attr("transform", "rotate(-90)")
    .text("Valence");

  // create the text for the x axis

  area = d3.area()
    .x(function (d) {
      var current = getDateFromString(d.data["Start Date"]);
      return x(current);
    })
    .y0(function (d) { return y(d[0]); })
    .y1(function (d) { return y(d[1]); })
    .curve(d3.curveBasis)

  const Tooltip = chartgroup
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("font-size", 17)

  const mouseover = function (event, d) 
  {
    var flag = false;

    var nodeList =d3.selectAll(".myCircle").each(function(d,i)
    { 
      // console.log(d3.select(this).style("opacity"))
      if(d3.select(this).style("opacity")==0.2)
      {
        flag = true;
      }
      
    })
    if(flag == false){
    Tooltip.style("opacity", 1)
    d3.selectAll(".myArea").style("opacity", .2)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
    d3.selectAll(".myCircle").style("opacity", .2)
    }
  }
  const mouseleave = function (event, d) {
    Tooltip.style("opacity", 0)
    d3.selectAll(".myArea").style("stroke-width", "0px")
    d3.selectAll(".myCircle").style("opacity", 1)
    updateOpacity()
    d3.selectAll(".myCircle")
      .style("opacity", 1)
      .style("stroke-width", "0px")
      .attr("r", 8).style("fill", "gray")

    d3.selectAll(".hidden_line").style("opacity", 1);
  }

  const mouseover1 = function (event, d) {
    Tooltip.style("opacity", 1)
    updateOpacity()
    d3.selectAll(".myCircle").style("opacity", 0.2)
    d3.select(".line_" + d["Start Date"]).style("opacity", 0);
    d3.select(".myCircle_" + d["Start Date"]).style("opacity", 0);
    d3.select(".hidden_circle_" + d["Start Date"]).attr("visibility", "visible")
    d3.select(".line_remove_" + d["Start Date"]).attr("visibility", "visible")
    d3.selectAll(".temp_remove_" + d["Start Date"]).attr("visibility", "visible")
    d3.selectAll(".hidden_line_" + d["Count"]).attr("visibility", "visible")
  }

  const mouseleave1 = function (event, d) {
    Tooltip.style("opacity", 0)

    d3.selectAll(".myCircle")
      .style("opacity", 1)
      .style("stroke-width", "0px")
      .attr("r", 8).style("fill", "gray")

    d3.select(".line_" + d["Start Date"]).style("opacity", 1);

  }

  drawAreaGraph(chartgroup, x);

  chartgroup.selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .attr("clip-path", "url(#clip)")
    .attr("class", function (d, i) { return "myArea myArea_" + keys_checkbox[i] })
    .style("fill", function (d) { key_color = d.key.replace("Valence", "Intensity"); return colors[key_color]; })
    .attr("d", area)
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave)
    .attr("opacity", 1)


  skipped_count = []
  filtered_data_stream_global = data_stream_global.filter(function (d) {

    keys_filter = Object.keys(d)
    except_list = ["Count", "Date", "Start Date", "End Date"]
    total = 0

    for (var i = 0; i < keys_filter.length; i++) {
      if (!except_list.includes(keys_filter[i])) {
        
        total += +d[keys_filter[i]]
      }
    }
    if (total == 0) {
      skipped_count.push(d["Count"])
      return false
    }
    return true;
  })


  chartgroup
    .selectAll("mylayers")
    // .data(data_stream_global)
    .data(filtered_data_stream_global)
    .enter()
    .append("circle")
    .attr("clip-path", "url(#clip)")
    .attr("class", function (d) { return "myCircle myCircle_" + d["Start Date"]; })
    .attr("cx", function (d) {
      return x(getDateFromString(d["Start Date"]));
    })
    .attr("cy", function (d) {
      
      thing = valence_averages[d["Count"]]
      return y(thing)
    })
    .attr("r", 10)
    .style("fill", "gray")
    .style("opacity", 1)
    // .style("stroke", "black")
    
    .on("mouseover", mouseover1)
    .on("mousemove", mouseover1)
    // .on("mouseleave", mouseleave1)

  var icons = chartgroup
    .selectAll("mylayers")
    .data(filtered_data_stream_global)
    .enter()
    .append('text')
    .attr('font-family', 'FontAwesome')
    .attr('font-size', 12)
    .style("stroke-width", 1)
    .html('&#xf061;')
    .style("fill", "white")
    .style("stroke", "white")
    .attr("clip-path", "url(#clip)")
    .attr("class", (d) => {
      return "line line_" + d["Start Date"] + " fa-thin fa-arrow-right"
    })
    .attr("x", function (d) {
      return x(getDateFromString(d["Start Date"])) - 4
    })
    .attr("y", function (d) {
      thing = valence_averages[d["Count"]]
      return y(thing) + 3
    })
    .style("stroke", "black")
    .style("stroke-width", 0.1)
    .attr("transform", function (d) {
      x_var = x(getDateFromString(d["Start Date"]));
      y_var = y(valence_averages[d["Count"]]);

      array = 0
      high = 0

      var currentData = data_global[d["Count"]]


      for (var i = 0; i < keys_dominance.length; i++) {

        if (currentData[keys_dominance[i]] > high) {
          high = currentData[keys_dominance[i]]
          array = i
        }
      }
      angle = (90 / 8) * array - 45
      return "rotate(" + angle + "," + x_var + "," + y_var + ")";
    })

  chartgroup
    .selectAll("mylayers")
    .data(filtered_data_stream_global)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return "hiddenc hidden_circle_" + d["Start Date"];
    })
    .attr("cx", function (d) {
      return x(getDateFromString(d["Start Date"]));
    })
    .attr("cy", function (d) {
      thing = valence_averages[d["Count"]]
      return y(thing)
    })
    .attr("r", 80)
    .style("fill", "#F8F8F8")
    .style("opacity", 1)
    .style("stroke", "black")
    .attr("visibility", "hidden")
    .on("mousemove", function (event, d) {
      d3.select(".hidden_circle_" + d["Start Date"]).attr("visibility", "visible")
      d3.select(".line_remove_" + d["Start Date"]).attr("visibility", "visible")
      d3.selectAll(".temp_remove_" + d["Start Date"]).attr("visibility", "visible")
      d3.selectAll(".hidden_line_" + d["Count"]).attr("visibility", "visible")
    })
    .on("mouseleave", function (event, d) {
      div.style("opacity", 0);
      d3.select(".hidden_circle_" + d["Start Date"]).attr("visibility", "hidden")
      if (d3.select(".line_remove_" + d["Start Date"]).style("stroke-width") != "2px") {
        d3.selectAll(".line_remove_" + d["Start Date"]).attr("visibility", "hidden")
      }
      d3.selectAll(".temp_remove_" + d["Start Date"]).attr("visibility", "hidden")
      d3.selectAll(".hidden_line_" + d["Count"]).attr("visibility", "hidden")
      mouseleave1(event, d)
    })
  
  data_packing_array = []
  for (var j = 0; j < updated_valences.length; j++) {
    var entry = updated_valences[j]

    if (skipped_count.includes(+entry["Count"])) { continue; }

    chartgroup.append("line")
      .style("stroke", "red")
      .attr("class", "line_remove line_remove_" + entry["Start Date"])
      .style("stroke-width", 0.5)
      .attr("x1", x(getDateFromString(entry["Start Date"])))
      .attr("y1", y(1))
      .attr("x2", x(getDateFromString(entry["Start Date"])))
      .attr("y2", y(-1))
      .attr("visibility", "hidden");


    data = []
    data_packing = []
    ratio_radius = 45
    highest = -Infinity
    lowest = Infinity


    for (var i = 0; i < keys_intensity.length; i++) {
      if (+intensity_percentages[entry["Count"]][keys_intensity[i]] > highest) {
        highest = +intensity_percentages[entry["Count"]][keys_intensity[i]]
      }
      if (+intensity_percentages[entry["Count"]][keys_intensity[i]] < lowest) {
        lowest = +intensity_percentages[entry["Count"]][keys_intensity[i]]
      }
    }

    scale_for_radius = 30

    for (var i = 0; i < keys_intensity.length; i++) {

      if (intensity_percentages[entry["Count"]][keys_intensity[i]] == 0) {
        continue;
      }
      dictionary_making = {}
      dictionary_sibling = {}
      dictionary_sibling["r"] = Math.min(Math.max((+intensity_percentages[j][keys_intensity[i]] - lowest) / (highest - lowest) * scale_for_radius, 7), 25)
      dictionary_sibling["key"] = keys_intensity[i]
      dictionary_sibling["count"] = j

      dictionary_making[keys_intensity[i]] = (+intensity_percentages[j][keys_intensity[i]]) * scale_for_radius


      if (!data_packing.includes(dictionary_sibling)) {
        data_packing.push(dictionary_sibling)
      }
      data.push(dictionary_making)
    }

    data_packing.sort((a, b) => b.r - a.r);



    d3.packSiblings(data_packing);

    data_packing_array.push(data_packing)

    x_offset = x(getDateFromString(entry["Start Date"]))
    y_offset = y(valence_averages[j])



    chartgroup
      .selectAll('whatever_circle')
      .data(data_packing)
      .enter()
      .append('circle')
      .attr('class', 'temp_remove_' + entry["Start Date"])
      .classed('node', true)
      .attr('cx', d => x_offset + d.x)
      .attr('cy', d => y_offset + d.y)
      .attr('r', d => Object.values(d)[0])
      .style("fill", function (d) {
        key_color = d.key.replace("Intensity", "Valence")
        return colors[d.key];
      })
      .style("stroke", "black")
      .style("stroke-width", 2)
      .attr("visibility", "hidden")
      .on("mouseover", function (event, e) {
        div.style("opacity", 1);
        

        key = e.key.replace("Intensity ", "")
        var entry_current = data_unchanged_global[e.count]
        
        div_context = "<b>" + key + "</b><br> Strength: " + round(intensity_percentages[e.count]["Intensity " + key] * 100) + "<br> Valence: " + round(updated_valences[e.count]["Valence " + key]) + "<br> Arousal: " + round(entry_current["Arousal " + key]) + "<br> Dominance: " + round(entry_current["Dominance " + key])

        div.html(div_context)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");

        var date_current = entry_current["Start Date"].split("/")
        var data_current_format = date_current[0] + "-" + monthNames[+date_current[1] - 1] + "-" + date_current[2]

        if (d3.select(".line_remove_" + data_current_format).style("stroke-width") == "2px"){

          d3.selectAll(".tweet_" + key.toLowerCase()).style("background-color", "rgb(242,153,58)");

          const el = document.getElementsByClassName("tweet_" + key.toLowerCase())[0];
          var topPos = el.offsetTop;
          const table = document.getElementById("tweetbox_svg");
          table.scrollTop = topPos;

        d3.selectAll(".pies").style("opacity","0.3")
        d3.selectAll(".pie_" + key.toLowerCase()).attr("stroke", "black").style("opacity","1").style("stroke-width", "2px")
        
        var nodeList = d3.selectAll(".pie_" + key.toLowerCase())
        nodeList.each(function(f)
        {
          var index = +d3.select(this).attr("class").split(" ")[0].replaceAll("pies_","")
          d3.selectAll(".pie_text_"+index).attr("visibility", "visible")
        })
      }
      })
      .on("mousemove", function (event, e) {

        key = e.key.replace("Intensity ", "")
        var entry_current = data_unchanged_global[e.count]

        div_context = "<b>" + key + "</b><br> Strength: " + round(intensity_percentages[e.count]["Intensity " + key] * 100) + "%<br> Valence: " + round(updated_valences[e.count]["Valence " + key]) + "<br> Arousal: " + round(entry_current["Arousal " + key]) + "<br> Dominance: " + round(entry_current["Dominance " + key])
        div.html(div_context)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");

        d3.select(".hidden_circle_" + e["Start Date"]).attr("visibility", "visible")
        d3.select(".line_remove_" + e["Start Date"]).attr("visibility", "visible")
        d3.selectAll(".temp_remove_" + e["Start Date"]).attr("visibility", "visible")
        d3.selectAll(".hidden_line_" + e["Start Date"]).attr("visibility", "visible")
      })
      .on("mouseleave", function (event, d) {
        key = d.key.replace("Intensity ", "").toLowerCase()
        div.style("opacity", 0);
        d3.selectAll(".pie_text").attr("visibility", "hidden")
        d3.selectAll(".pie_" + key).attr("stroke", "none").style("stroke-width", "0px")
        // d3.selectAll(".pie_" + key).attr("stroke-width", "0px")
        d3.selectAll(".pies").attr("stroke-width", "0px").style("opacity","1")
        d3.selectAll(".tweet_" + key).style("background-color", "white");
      }).style("opacity", function (d) {
        current_key = d.key.replace("Intensity", "Arousal")
        return Math.max(round(data_unchanged_global[d.count][current_key]), 0.15)
      })
      .on("click", function (event, e) {

        var entry_current = data_unchanged_global[e.count]
        // console.log("click part")
        displaytweets(entry_current)
        var date_current = entry_current["Start Date"].split("/")
        var data_current_format = date_current[0] + "-" + monthNames[+date_current[1] - 1] + "-" + date_current[2]

        d3.selectAll(".line_remove").style("stroke-width", "1px").attr("visibility", "hidden")
        d3.selectAll(".upper_line_remove").style("stroke-width", "1px").attr("visibility", "hidden")
        d3.select(".line_remove_" + data_current_format).style("stroke-width", "2px").attr("visibility", "visible")
        d3.select(".upper_line_remove_" + data_current_format).style("stroke-width", "2px").attr("visibility", "visible")
      });


    var icons = chartgroup
      .selectAll("mylayers")
      .data(data_packing)
      .enter()
      .append('text')
      .attr('font-family', 'FontAwesome')
      .attr('font-size', 12)
      .style("stroke-width", 1)
      .html('&#xf061;')
      .style("fill", "black")
      .style("stroke", "white")
      .attr("visibility", "hidden")
      .attr("class", (d) => {

        return "hidden_line hidden_line_" + j + " fa-thin fa-arrow-right"
      })
      .attr("x", d => x_offset + d.x - 4)
      .attr("y", d => y_offset + d.y + 3)
      .style("stroke", "black")
      .style("stroke-width", 0.1)
      .attr("transform", function (d) {


        x_var = x_offset + d.x;
        y_var = y_offset + d.y;

        array = 0
        high = 0
        current_key = d.key.replace("Intensity", "Dominance")
        var currentData = data_unchanged_global[j]
        array = currentData[current_key]
        angle = (90) * array - 45
        return "rotate(" + angle + "," + x_var + "," + y_var + ")";
      })

  }

  chartgroup.append("line")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .attr("class", "linenr")
    .attr("x1", x(getDateFromString(updated_valences[0]["Date"])))
    .attr("y1", y(0))
    .attr("x2", x(getDateFromString(updated_valences[updated_valences.length - 1]["Date"])))
    .attr("y2", y(0));

}

function round(num) {
  return Math.round(+num * 100) / 100
}


function updateOpacity() {

  for (i = 0; i < keys_checkbox.length; i++) {
    if (document.getElementById(keys_checkbox[i]).checked == true) {
      d3.selectAll(".myArea_" + keys_checkbox[i]).style("opacity", 0.3)
    }
    else {
      d3.selectAll(".myArea_" + keys_checkbox[i]).style("opacity", 1)
    }
  }
}

function boldString(str, substr) {
  var strRegExp = new RegExp(substr, 'ig');
  new_string = str.replace(strRegExp, '<b>' + substr + '</b>');
  return new_string;
}

function displaytweets(entry_current) {

  var tweet_svg = d3.select("#tweetbox_svg");
  tweet_svg.selectAll("tr").remove();
  // console.log("in displaytweets")

  var user = document.getElementById("user");
  var value = user.value;
  var text = user.options[user.selectedIndex].text;

  start_date = entry_current["Start Date"]
  end_date = entry_current["End Date"]
  // console.log(start_date)
  // console.log(end_date)

  if (text === "Rihanna") {
    csv_name = "/data/tweet_triggers_timestamps_rihanna.csv"

  } else if (text === "Oprah") {
    csv_name = "/data/tweet_triggers_timestamps_oprah.csv"

  } else if (text === "Barack Obama") {
    csv_name = "/data/tweet_triggers_timestamps_obama.csv"
    var columns = ['Start Date', 'End Date', 'Trigger Words', 'Tweet Count', 'Tweet0', 'Tweet0 Timestamp', 'Tweet1', 'Tweet1 Timestamp', 'Tweet2', 'Tweet2 Timestamp', 'Tweet3', 'Tweet3 Timestamp', 'Tweet4', 'Tweet4 Timestamp', 'Tweet5', 'Tweet5 Timestamp']
  } else if (text === "Bill Gates") {
    csv_name = "/data/tweet_triggers_timestamps_gates.csv"
    var columns = ['Start Date', 'End Date', 'Trigger Words', 'Tweet Count', 'Tweet0', 'Tweet0 Timestamp', 'Tweet1', 'Tweet1 Timestamp', 'Tweet2', 'Tweet2 Timestamp', 'Tweet3', 'Tweet3 Timestamp', 'Tweet4', 'Tweet4 Timestamp', 'Tweet5', 'Tweet5 Timestamp', 'Tweet6', 'Tweet6 Timestamp', 'Tweet7', 'Tweet7 Timestamp', 'Tweet8', 'Tweet8 Timestamp', 'Tweet9', 'Tweet9 Timestamp']
  } else if (text === "Jimmy Falon") {
    csv_name = "/data/tweet_triggers_timestamps_falon.csv"
  }


  d3.csv(csv_name).then(function (data) {

    var all_words = []
    for (var i = 0; i < data.length; i++) {
      if (data[i]["Start Date"] == start_date && data[i]["End Date"] == end_date) {
        tweet_count = data[i]["Tweet Count"]

        var tweets_dict = [];
        tweet_map = {}
        for (var j = 0; j < tweet_count; j++) {
          key_name = data[i]["Tweet" + j]
          value_name = data[i]["Tweet" + j + " Timestamp"]

          tweets_dict.push({
            key: key_name,
            value: value_name
          });
          tweet_map[key_name] = value_name;
        }

        var twigger_words = data[i]["Trigger Words"].replaceAll("'", "").replaceAll("[", "").replaceAll("]", "").replaceAll(" ", "").split(",")
        twigger_words.forEach((c) => {
          if (!all_words.includes(c) & c != "") {
            all_words.push(c);
          }});

        var tr = d3.select(".tweettable tbody")
          .selectAll("tr")
          .data(tweets_dict)
          .enter().append("tr");

        var td = tr.selectAll("td")
          .data(function (d, i) { return Object.values(d); })
          .enter().append("td")
          .attr("class",function(d){
            var tweet_content = d;
            var class_string = "";
            for (var it = 0; it < all_words.length; it++) {
              var strRegExp = new RegExp(all_words[it], 'ig');
              if(strRegExp.test(tweet_content)){
                var map = words_map[all_words[it]];
                for (let key of Object.keys(map)) {
                  value = map[key]
                  if(value == 1 && !class_string.includes("tweet_"+key)){
                    if(class_string==""){
                      class_string+= "tweet_"+key;
                    }else{
                      class_string+= " tweet_"+key;
                    }
                  }
                }
              }
            }

            for(var it = 0; it < all_words.length; it++)
            {
              if(tweet_content.includes(all_words[it])){
              class_string+= " trigger_"+all_words[it];
              }
            }
            if(class_string==""){
              class_string = "tweet";
            }
            return class_string + " tweet_all";
          })
          .html(function (d) {
            newString = d
            for (var i = 0; i < all_words.length; i++) {
              newString = boldString(newString, all_words[i])
            }
            return newString;
          })
          .on("mouseover", function(i,d){
            d3.selectAll(".tweet_all").style("border", "0px solid black").style("background-color", "white");
            d3.selectAll(".pies").style("opacity","0.3")
            for(var i=0;i<all_words.length;i++) 
            {
              if(d.toLowerCase().search(all_words[i]) != -1)
              {
              d3.selectAll(".pies_"+all_words[i]).style("opacity","1").style("stroke","black").style("stroke-width", "2px")
              d3.selectAll(".hidden_pie_text_"+all_words[i]).attr("visibility","visible")
              }
            }

            d3.select(this).style("background-color", "rgb(242,153,58)");
            if(d in tweet_map){
              var dateStr = tweet_map[d].split(" ")[0].trim();
            
              var day = parseInt(dateStr.substring(8));
              var month = parseInt(dateStr.substring(5, 7))-1;
              var year = parseInt(dateStr.substring(0,4));
              var date = new Date(year, month, day);

              chartgroup
              .append("circle")
              .attr("class","tmp_tweet_position_circle")
              .style("stroke", "black")
              .style("fill", "rgb(242,153,58)")
              .attr("r", 5)
              .attr("cx", streamxaxis(date))
              .attr("cy", streamyaxis2(0.2));

              
            }

            
            
          })
          .on("mouseout", function(i,d){

            // console.log("out")
            // d3.selectAll(".pies").style("opacity","1").style("stroke","none")
            d3.select(this).style("background-color", "white");
            d3.selectAll(".pies").style("opacity","1")
            
            
            for(var i=0;i<all_words.length;i++) 
            {
              if(d.toLowerCase().search(all_words[i]) != -1)
              {
              d3.selectAll(".pies_"+all_words[i]).style("stroke-width", "0px")
              d3.selectAll(".hidden_pie_text_"+all_words[i]).attr("visibility","hidden")
              }
            }


            chartgroup.select(".tmp_tweet_position_circle").remove();
          })
          .on("click", function(i,d)
          {
            // console.log(d3.select(this).attr("class"))
            chartgroup.select(".tmp_tweet_position_circle").remove();
            // console.log(d3.selectAll(".tweet_all"))
            var oldcolor = d3.select(this).style('border-color');

            d3.selectAll(".pies").style("stroke-width", "0px")
            d3.selectAll(".pie_text").attr("visibility","hidden")

            for(var i=0;i<all_words.length;i++) 
                {
                  if(d.toLowerCase().search(all_words[i]) != -1)
                  {
                  d3.selectAll(".pies_"+all_words[i]).style("stroke","black").style("stroke-width", "2px")
                  d3.selectAll(".hidden_pie_text_"+all_words[i]).attr("visibility","visible")
                  }
                }

            d3.selectAll(".tweet_all").each(function(d,i)
            {
            d3.select(this).style("background-color", "white").style("border", "0px");
            })
            if(oldcolor != "black"){
              d3.select(this).style("border", "1px solid black");
            }
          })


      }
    }
    plotwordgraph(twigger_words)
  });

}


function plotwordgraph(tweet_array) {
  const margin = { top: 20, right: 10, bottom: 20, left: 10 },
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    innerRadius = 80,
    outerRadius = Math.min(width, height) / 2;

  var svg = d3.select("#my_dataviz_svg")
  svg.selectAll('*').remove();

  // Create scale
  var xscale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  var yscale = d3.scaleLinear().domain([0, 1]).range([height, 10]);

  // Add scales to axis
  var x_axis = d3.axisBottom().scale(xscale);
  var y_axis = d3.axisLeft().scale(yscale);

  //Append group and insert axis
  svg.append("g")
    .attr('transform', 'translate(10, ' + (height + 10) / 2 + ')')
    .call(x_axis);

  svg.append("g")
    .attr("transform", "translate(" + (width + 20) / 2 + ", 10)")
    .call(y_axis);

  var div = d3.select("body").append("div")
    .attr("class", "test")
    .html("hello")
    .style("opacity", 0);


  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width + 25)
    .attr("y", height / 2)
    .text("Arousal");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", height / 2 + 25)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Valence");


  data_word = {}

  var filtered_anew_lexicon = anew_lexicon.filter(function (d) {
    return tweet_array.includes(d["Description"])
  })

  var new_tweet_array = filtered_anew_lexicon.map(function (d) {
    var data_for_plot = {}
    var name = d["Description"]
    data_for_plot["name"] = name;
    var lookup = nrc_lexicon.filter((d) => name == d["Word"])
    lookup.map(function (e) {
      d["Intensity " + capitalizeFirst(e["Emotion"])] = e["Count"]

    })
    return d
  })

  new_tweet_array = new_tweet_array.filter(function (d) {
    var keys = Object.keys(d);

    return keys.includes("Intensity Anger");
  })


  var max_radius = 15
  var min_radius = 6

  var getKeys = ["Intensity Disgust", "Intensity Sadness", "Intensity Surprise", "Intensity Fear", "Intensity Trust", "Intensity Joy", "Intensity Anticipation", "Intensity Anger"]

  for (var i = 0; i < new_tweet_array.length; i++) {

    var OldRange = [0, 1]
    var OldValue = +new_tweet_array[i]["Dominance Mean"]

    var radius = (((OldValue - OldRange[0]) * (max_radius - min_radius)) / 1) + min_radius;

    var data_current = new_tweet_array[i];
    data_current["Count"] = i

    var data_pie = {};
    var object_key = Object.keys(data_current);
    var class_string = "pies_" + i
    class_string += " pies_" + data_current["Description"] +" pies"
    var text_label = data_current["Description"]
    var string = ""

    for (var j = 0; j < object_key.length; j++) {

      if (getKeys.includes(object_key[j]) & +data_current[object_key[j]] > 0) {
        data_pie[object_key[j]] = data_current[object_key[j]]
        class_string += " pie_" + object_key[j].replace("Intensity ", "").toLowerCase()
        string += " " + object_key[j].replace("Intensity ", "").toLowerCase()
      }
    }
    new_tweet_array[i]["allWords"] = string

    var pie = d3.pie().value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(data_pie))

    svg
      .append("g")
      .attr('transform', 'translate(' + xscale(data_current["Arousal Mean"]) + ', ' + yscale(data_current["Valence Mean"]) + ')')
      .selectAll('whatever')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
      )
      .attr("class", function (d) {
        return class_string;
      })
      .attr('fill', function (d) { return (colors[d.data.key]) })
      .style("opacity", 0.7)
      .on("mouseover", function (d, i) {
        div.style("opacity", 1);
        var current_class = d3.select(this).attr("class")
      
        var old_class = current_class.split(" ")[0];
        d3.selectAll("." + old_class).attr("stroke", "black").style("stroke-width", "2px")
        var index = old_class.replaceAll("pies_", "")
        var key = new_tweet_array[index]["Description"]



        var div_context = "<b>" + key + "</b>"
          + "<br> Valence: " + round(new_tweet_array[index]["Valence Mean"])
          + "<br> Arousal: " + round(new_tweet_array[index]["Arousal Mean"])
          + "<br> Dominance: " + round(new_tweet_array[index]["Dominance Mean"])
          + "<br> Emotions: " + new_tweet_array[index]["allWords"]



        div.html(div_context)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");

      })
      .on("mousemove", function (d, i) {
        var current_class = d3.select(this).attr("class")
        var old_class = current_class.split(" ")[0];
        var index = old_class.replaceAll("pies_", "")
        var key = new_tweet_array[index]["Description"]
        var div_context = "<b>" + key + "</b>"
          + "<br> Valence: " + round(new_tweet_array[index]["Valence Mean"])
          + "<br> Arousal: " + round(new_tweet_array[index]["Arousal Mean"])
          + "<br> Dominance: " + round(new_tweet_array[index]["Dominance Mean"])
          + "<br> Emotions: " + new_tweet_array[index]["allWords"]
        div.html(div_context)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseleave", function (d, i) 
      {
        var flag = false;

        if (flag == false) {

        var current_class = d3.select(this).attr("class")
        var old_class = current_class.split(" ")[0];
        d3.selectAll("." + old_class).style("stroke-width", "0px")
        div.style("opacity", 0);
        }
      })
      .on("click", function (d, i) 
      {
        var key = "trigger_" + d3.select(this).attr("class").split(" ")[1].replaceAll("pies_", "")
        d3.selectAll(".tweet_all").style("border", "0px solid black").style("background-color", "white");
        d3.selectAll("." + key).style("border", "1px solid black").style("background-color", "rgb(242,153,58)");
        var current_class = d3.select(this).attr("class")
      
        var old_class = current_class.split(" ")[0];
        d3.selectAll("." + old_class).attr("stroke", "black").style("stroke-width", "2px")

        var index = key.replaceAll("trigger_", "")

      })

      svg.append("text")
      .attr("class", "hidden_pie_text_"+text_label +" pie_text pie_text_"+i)
      .attr("x", xscale(data_current["Arousal Mean"]) +15)

      .attr("y", yscale(data_current["Valence Mean"]))
      .attr("font-size", "10px")
      .text(text_label)
      .attr("visibility", "hidden")
      ;

  }

}

function clearwordgraph() {
  d3.select("#my_dataviz_svg").selectAll('*').remove();
}

function capitalizeFirst(str) {
  const str2 = str.charAt(0).toUpperCase() + str.slice(1);
  return str2;
}