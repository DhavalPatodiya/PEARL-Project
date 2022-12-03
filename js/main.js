var input_file = "data/data.csv";
// var input_file = "Preprocessing/segmented_parameters_falon.csv"
var data_global;
var tweet_input;
var data_stream_global;
var tweet_count_data;
var valence_averages;
var updated_valences;
var data_packing_array;
var widthPlease = 1000;
var heightPlease = 350;
const formatMonthPlease = d3.timeFormat("%B");
const date = new Date(2014, 1, 1);
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
var y;
var months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
var colors = {
  'Intensity Anger': "rgb(228,48,84)", 'Intensity Anticipation': "rgb(242,153,58)", 'Intensity Disgust': "rgb(159,120,186)",
  'Intensity Fear': "rgb(53,164,80)", 'Intensity Joy': "rgb(250,219,77)", 'Intensity Sadness': "rgb(114,157,201)",
  'Intensity Surprise': "rgb(63,165,192)", 'Intensity Trust': "rgb(153,204,51)"
};
var keys_dominance = ["Dominance Disgust", "Dominance Sadness", "Dominance Surprise", "Dominance Fear", "Dominance Trust", "Dominance Joy", "Dominance Anticipation", "Dominance Anger"]

//data
var segmented_parameters_rihanna;
var segmented_parameters_oprah;
var segmented_parameters_obama;
var segmented_parameters_gates;
var segmented_parameters_falon;

var tweet_triggers_timestamps_rihanna;
var tweet_triggers_timestamps_oprah;
var tweet_triggers_timestamps_obama;
var tweet_triggers_timestamps_gates;
var tweet_triggers_timestamps_falon;

var nrc_lexicon;
var anew_lexicon;

var count_dictionary = {};
var words_map = {};
//stream
var offset = d3.stackOffsetWiggle;

var calcavg = ["segmented_parameters_rihanna", "segmented_parameters_oprah", "segmented_parameters_obama", "segmented_parameters_gates", "segmented_parameters_falon"];

var total_emotion = {};
var avg_emotion = [];
var startrow = {
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
}

function updateGlobalData() {
  var user_selected = String(document.getElementById('user').value).trim();
  if (user_selected === "segmented_parameters_rihanna") {
    data_global = segmented_parameters_rihanna;
  } else if (user_selected === "segmented_parameters_oprah") {
    data_global = segmented_parameters_oprah;
  } else if (user_selected === "segmented_parameters_obama") {
    data_global = segmented_parameters_obama;
  } else if (user_selected === "segmented_parameters_gates") {
    data_global = segmented_parameters_gates;
  } else if (user_selected === "segmented_parameters_falon") {
    data_global = segmented_parameters_falon;
  }
}

function updateTweetCountData() {
  tweet_count_data = []

  var user_selected = String(document.getElementById('user').value).trim();

  if (user_selected === "segmented_parameters_rihanna") {
    tweet_input = tweet_triggers_timestamps_rihanna;
  } else if (user_selected === "segmented_parameters_oprah") {
    tweet_input = tweet_triggers_timestamps_oprah;
  } else if (user_selected === "segmented_parameters_obama") {
    tweet_input = tweet_triggers_timestamps_obama;
  } else if (user_selected === "segmented_parameters_gates") {
    tweet_input = tweet_triggers_timestamps_gates;
  } else if (user_selected === "segmented_parameters_falon") {
    tweet_input = tweet_triggers_timestamps_falon;
  }

  for (var i = 0; i < tweet_input.length; i++) {
    var map = {}
    map["Count"] = parseInt(tweet_input[i]["Tweet Count"]);

    array_start = tweet_input[i]["Start Date"].split("/")
    array_end = tweet_input[i]["End Date"].split("/")

    var j = 0;

    var desc = ""

    while(tweet_input[i]["Tweet"+j] != null)
    {
      if(tweet_input[i]["Tweet"+j] != "")
      {
        desc += tweet_input[i]["Tweet"+j]
      }
      j+=1
    }

    map["Start Date"] = array_start[0] + "-" + monthNames[parseInt(array_start[1]) - 1] + "-" + array_start[2]
    map["End Date"] = array_end[0] + "-" + monthNames[parseInt(array_end[1]) - 1] + "-" + array_end[2]
    map["Trigger Words"] = tweet_input[i]["Trigger Words"];
    map["All Sentences"] = desc;
    tweet_count_data.push(map);
  }
}

function drawAll() {
  d3.select("#graph_svg").selectAll("*").remove();
  d3.select("#extension_svg").selectAll("*").remove();
  d3.select("#streamOvrGraph").selectAll("*").remove();
  d3.select("#my_dataviz_svg").selectAll("*").remove();
  d3.select("#tweettablebody").selectAll("*").remove();
  draw();
  drawextension();
  drawStreamOverview();
}

function calculateWordsMapping(){
  for (var i = 0; i < nrc_lexicon.length; i++) {
      var el = nrc_lexicon[i];
      if(!(el["Word"] in words_map)){
        words_map[el["Word"]] = {};
      }
      words_map[el["Word"]][el["Emotion"]] = el["Count"];
    }
    // console.log(words_map)
}

var x, y, brush;
var div_tweets;
var xAxis, chartgroup, area, streamxaxis, focus, streamyaxis, streamyaxis2, dstackedData, display_valences, filtered_data_stream_global;
var barsOpacity, maxTweetCount;
var skipped_count;
var idleTimeout
function idled() { idleTimeout = null; };