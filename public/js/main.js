google.charts.load('current', {packages: ['corechart']});
//google.load("visualization", "1", {packages:["corechart"]});
google.charts.setOnLoadCallback(drawOverallBarChart);
google.charts.setOnLoadCallback(drawOverallPieChart);

$(document).ready(function(){
    //When submitted number of article, respond with number of least/most revisions for overall data
    $('#numOfArticleSubmit').on('click', function(e){
      var getnumber = $('#number').val();
      console.log(parseInt(getnumber));
      if(isNaN(parseInt(getnumber))){
        console.log("is not number");
        $('#numbererror').html("Invalid input. Please input number.")
        e.preventDefault();
      }
      else{
        var parameters = {numberofarticle: $('#number').val() };
        $.get('/main/getHighLowRev', parameters, function(result) {
          $('#numbererror').html("");
          $('#numHighLowResult').html(result);
        });
      }
    });

    //When submitted article title, respond with that article's data analytics
    $('#selectArticleSubmit').on('click', function(e){
      var article = $('#selectArticle').val();
      console.log(article);
      var encodedArticle = encodeURIComponent(article);
      $.get("/main/article?title=" + encodedArticle, function(result) {
        //console.log(result);
        $('#individualTitle').html(result);
      });
    });

    //When submitted author's name, respond with that author's data analytics result
    $('#selectAuthorSubmit').on('click', function(e){
      var author = $('#selectAuthor').val();
      var encodedAuthor = encodeURIComponent(author);
      console.log(author);
      $.get("/main/author?user=" + encodedAuthor, function(result) {
        //console.log(result);
        $('#authorerror').html("");
        $('#authorAnalyticsResult').html(result);
      });
    });

    //Display Overall section
    $('#overallMenu').on('click', function(e){
      $('#overallSection').css("display", "block");
      $('#individualSection').css("display", "none");
      $('#authorSection').css("display", "none");
    });

    //Display Individual section
    $('#individualMenu').on('click', function(e){
      $('#overallSection').css("display", "none");
      $('#individualSection').css("display", "block");
      $('#authorSection').css("display", "none");
    });

    //Display Author section
    $('#authorMenu').on('click', function(e){
      $('#overallSection').css("display", "none");
      $('#individualSection').css("display", "none");
      $('#authorSection').css("display", "block");
    });

    //Display overall bar chart
    $('#slide-item-1').on('click', function(e){
      $('#overallBarChartSec').css("display", "block");
      $('#overallPieChartSec').css("display", "none");
    });

    //Display overall pie chart
    $('#slide-item-2').on('click', function(e){
      $('#overallBarChartSec').css("display", "none");
      $('#overallPieChartSec').css("display", "block");
    });

    //When user logout
    $('#logout').on('click', function(e){
      console.log("Log out");
      $.get("/logout", function(result) {
        $("html").html(result);
      });
    });
});


function drawOverallBarChart(){
  var jsondata = {};
  //console.log(overallBarChart);
  overallBarChart.forEach(function(field){
    if(!jsondata[field.year]){
      jsondata[field.year] = {};
    }
    //console.log(field.numbOfRev);
    jsondata[field.year][field.usertype] = parseInt(field.numbOfRev);
  })

  var bar = [['Year', 'Administrator', 'Anonymous', 'Bot', 'Regular']];
  for(var row in jsondata){
    var barRow = [row];
    barRow.push(jsondata[row].admin);
    barRow.push(jsondata[row].anon);
    barRow.push(jsondata[row].bot);
    barRow.push(jsondata[row].regular);
    bar.push(barRow);
  }
  var data = google.visualization.arrayToDataTable(bar);
  var options = {
      'title':"Revision number distribution by year and by user type across the whole dataset",
      'width':900,
      'height':500,
      colors: ['#bf5f5f', '#ffafaf', '#ff9b41', '#bb245f']
  };
  var chart = new google.visualization.ColumnChart($("#overallBarChartSec")[0]);
  chart.draw(data, options);
}

function drawOverallPieChart(){
  var usertype = [['user type', 'number of revision']];
  var pieindex;
  var i = 0;
  //console.log(overallPieChart);
  overallPieChart.forEach(function(field){
    //console.log(field.usertype + field.numbOfRev);
    var piesection = [field.usertype, field.numbOfRev];
    usertype.push(piesection);
    if(field.usertype == "admin"){pieindex = i;}
    i++;
  })
  var str = "";
  var tooltip = [];
  //console.log(overallRevAdminType);
  overallRevAdminType.forEach(function(field){
    //console.log(field._id + field.numbOfRev);
    str = str + field._id + " " + field.numbOfRev + "<br>";
  })
  tooltip.push(str);

  var data = google.visualization.arrayToDataTable(usertype);
  var options = {
      'title':"Revision number distribution by user type across the whole data set",
      'width':900,
      'height':550,
      colors: ['#bf5f5f', '#ee9c9c', '#f2bc8b', '#de7e34'],
      tooltip: { isHtml: true }
  };
  var chart = new google.visualization.PieChart($("#overallPieChartSec")[0]);

  var sliceid = 0;
  function eventHandler(e){
    chart.setSelection([e]);
    try {
      selection = chart.getSelection();
      //console.log(selection);
      sliceid = selection[0].row - pieindex;
      //console.log("sliceid: " + sliceid);
    }
    catch(err) {
      ;
    }
    //$(".google-visualization-tooltip-item-list li:eq(0)").css("font-weight", "bold");
    $(".google-visualization-tooltip-item-list li:eq(1)").html(tooltip[sliceid]).css("font-family", "Arial");
  }
  google.visualization.events.addListener(chart, 'onmouseover', eventHandler);
  var container = document.getElementById('overallPieChartSec');
  google.visualization.events.addListener(chart, 'ready', function () {
    container.style.display = 'none';
  });
  chart.draw(data, options);
}
