
function get_avg_emotion() {

    calcavg.forEach(csvfile => {
        window[csvfile].forEach(data => {
            let date = data['Start Date'];
            date = date.split("/");
            // console.log(date);
            let mapkey = date[1] + "/" + date[2];
            if (!(mapkey in total_emotion)) {
                total_emotion[mapkey] = {
                    "Arousal Anger": [],
                    "Arousal Anticipation": [],
                    "Arousal Disgust": [],
                    "Arousal Fear": [],
                    "Arousal Joy": [],
                    "Arousal Sadness": [],
                    "Arousal Surprise": [],
                    "Arousal Trust": [],
                    "Dominance Anger": [],
                    "Dominance Anticipation": [],
                    "Dominance Disgust": [],
                    "Dominance Fear": [],
                    "Dominance Joy": [],
                    "Dominance Sadness": [],
                    "Dominance Surprise": [],
                    "Dominance Trust": [],
                    "Intensity Anger": [],
                    "Intensity Anticipation": [],
                    "Intensity Disgust": [],
                    "Intensity Fear": [],
                    "Intensity Joy": [],
                    "Intensity Sadness": [],
                    "Intensity Surprise": [],
                    "Intensity Trust": [],
                    "Valence Anger": [],
                    "Valence Anticipation": [],
                    "Valence Disgust": [],
                    "Valence Fear": [],
                    "Valence Joy": [],
                    "Valence Sadness": [],
                    "Valence Surprise": [],
                    "Valence Trust": []
                };
            }
            let row = total_emotion[mapkey];
            for (let key in row) {
                if (key in data) {
                    var get = row[key];
                    if ((+data[key] > 0)) {
                        get.push(+data[key]);
                    }
                    row[key] = get;
                }
            }

            total_emotion[mapkey] = row;
            // console.log("tt",total_emotion[mapkey]);
        })
    });
    var max = -Infinity;
    var min = Infinity;
    // console.log("ttt", total_emotion);
    for (var key in total_emotion) {
        let row = total_emotion[key];
        let newRow = {};
        for (var rowkey in startrow) {
            let val = row[rowkey];
            // console.log("arrr", val);
            let avg = d3.mean(val);


            if (typeof (avg) == 'undefined') {
                avg = 0;

            }
            if (max < d3.max(val)) {
                max = d3.max(val);
            }
            if (min > d3.min(val)) {
                min = d3.min(val);
            }
            newRow[rowkey] = avg;
        }
        let splitkey = key.split("/");
        // console.log(splitkey);
        if (key != "01/2019") {
            newRow['Start Date'] = new Date(splitkey[1], splitkey[0], 0);
            // console.log(newRow['Start Date'] );
            avg_emotion.push(newRow);
        }
    };

    avg_emotion.sort(function (a, b) {
        var keyA = a['Start Date'],
            keyB = b['Start Date'];
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    // console.log("ttt", avg_emotion);
    // console.log(max, min);

}

function drawextension() {
    updateGlobalData();

    get_avg_emotion();
    var svg = d3.select("#extension_svg");

    data_global = avg_emotion;
    // create a chart group
    var chartgroup = svg.append("g").attr("transform", "translate(113, 40)");

    var width = widthPlease;
    var height = heightPlease;
    // scales and axes
    var x = d3.scaleTime()
        .domain(d3.extent(avg_emotion, function (d) {
            return (d["Start Date"]);
        }))
        .range([0, widthPlease - 50]);
    var y = d3.scaleLinear().domain([0, 0.7]).range([height, 0]);


    // draw the axes
    chartgroup.append("g").attr("class", "myYaxis").call(d3.axisLeft(y));
    chartgroup
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "myXaxis")
        .call(d3.axisBottom(x));

    // create the text for the y axis
    chartgroup
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -50)
        .attr("dy", ".75em")
        .attr("x", -(height / 2) + 50)
        .attr("transform", "rotate(-90)")
        .text("Intensity Average for all Users");


    opacity = 100;

    for (var key in colors) {
        // console.log("key", key)
        path = chartgroup.append("path")
            .datum(data_global)
            .attr("fill", "none")
            .attr("stroke", colors[key])
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .style("opacity", 0)
            .on('mouseover', function (d, i) {
                // console.log("vvv", this.key);
            })
            .on('mouseout', function (d, i) {

            })
            .transition().delay(1000).ease(d3.easeSin).duration(1500)
            .style("opacity", opacity / 100)

            .attr("d", d3.line()
                .x(function (d) { return x(d['Start Date']) })
                .y(function (d) {
                    // console.log("line of" ,key); 
                    return y(+d[key])
                })
            )
        chartgroup.append("text")
            // .attr("class", "text_"+countri[i].geo + " liie")
            .attr("x", x(data_global.at(-1)['Start Date']))
            .attr("y", y(+data_global.at(-1)[key]))
            .attr("dx", ".35em")
            .style("opacity", 0)
            .attr("text-anchor", "start")
            // .style("fill", color[this.value])

            // .transition().delay(1000).ease(d3.easeSin).duration(3500)
            .style("opacity", opacity / 100)
            .text(key.split(" ")[1]);

        // path
    }
}