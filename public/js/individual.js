google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawArticleBarChart);
google.charts.setOnLoadCallback(drawArticlePieChart);

$(document).ready(function(){
  //Display individual bar chart #1
  $('#slide-item-3').on('click', function(e){
    $('#articleBarChartSec').css("display", "block");
    $('#articlePieChartSec').css("display", "none");
    $('#articleBarChartSec2').css("display", "none");
  });

  //Display individual pie chart
  $('#slide-item-4').on('click', function(e){
    $('#articleBarChartSec').css("display", "none");
    $('#articlePieChartSec').css("display", "block");
    $('#articleBarChartSec2').css("display", "none");
  });

  //Display individual bar chart 2
  $('#slide-item-5').on('click', function(e){
    $('#articleBarChartSec').css("display", "none");
    $('#articlePieChartSec').css("display", "none");
    $('#articleBarChartSec2').css("display", "block");
  });

    //When submitted user lists and year range of the article, respond with bar chart
    $('#selectUserYrSubmit').on('click', function(e){
      var article = $('#selectArticle').val();
      var topusers = $('#selectUser').val();
      var from = $('#selectMinYear').val();
      var to = $('#selectMaxYear').val();
      if(from >= to){
        console.log("invalid range");
        $('#topusererror').html("Invalid year range. Please select the year range again.")
        e.preventDefault();
      }
      else if(topusers == null || from == "From" || to == "To"){
        console.log("not all selected");
        $('#topusererror').html("Some fields are not selected. Please select all fields.")
        e.preventDefault();
      }
      else{
        var encodedArticle = encodeURIComponent(article);
        var encodedUser = encodeURIComponent(topusers);
        var route = "/main/article/getBar?title=" + encodedArticle + "&topusers=" + encodedUser + "&from=" + from + "&to=" + to;
        console.log(from + " " + to + " " + topusers);
        //console.log(typeof(user));
        $.get(route, function(result) {
          console.log(result);
          $('#topusererror').html("");
          $('#individualTitleTop5BarChart').html(result)
        });
      }
    });
});


function drawArticleBarChart(){
  var jsondata = {};
  if (typeof articleBarChart === 'undefined'){
    //console.log("do nothing");
  }
  else{
    articleBarChart.forEach(function(field){
      if(!jsondata[field.year]){
        jsondata[field.year] = {};
      }
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
        'title':"Revision number distributed by year and by user type of the article: " + $('#selectArticle').val(),
        'width':900,
        'height':500,
        colors: ['#bf5f5f', '#ffafaf', '#ff9b41', '#bb245f']
    };
    var chart = new google.visualization.ColumnChart($("#articleBarChartSec")[0]);
    chart.draw(data, options);
  }
}

function drawArticlePieChart(){
  if (typeof articlePieChart != 'undefined'){
    var usertype = [['user type', 'number of revision']];
    var pieindex;
    var i = 0;
    articlePieChart.forEach(function(field){
      var piesection = [field.usertype, field.numbOfRev];
      usertype.push(piesection);
      if(field.usertype == "admin"){pieindex = i;}
      i++;
    })
    var str = "";
    var tooltip = [];
    articleAdminType.forEach(function(field){
      str = str + field._id + " " + field.numbOfRev + "<br>";
    })
    tooltip.push(str);
    var data = google.visualization.arrayToDataTable(usertype);
    var options = {
        'title':"Revision number distribution by user type of the article: " + $('#selectArticle').val(),
        'width':900,
        'height':550,
        colors: ['#bf5f5f', '#ee9c9c', '#f2bc8b', '#de7e34'],
        tooltip: { isHtml: true }
    };
    var chart = new google.visualization.PieChart($("#articlePieChartSec")[0]);

    var sliceid = 0;
    function eventHandler(e){
      chart.setSelection([e]);
      try {
        selection = chart.getSelection();
        sliceid = selection[0].row - pieindex;
      }
      catch(err) {
        ;
      }
      //$(".google-visualization-tooltip-item-list li:eq(0)").css("font-weight", "bold");
      $(".google-visualization-tooltip-item-list li:eq(1)").html(tooltip[sliceid]).css("font-family", "Arial");
    }
    google.visualization.events.addListener(chart, 'onmouseover', eventHandler);
    var container = document.getElementById('articlePieChartSec');
    google.visualization.events.addListener(chart, 'ready', function () {
      container.style.display = 'none';
    });
    chart.draw(data, options);
  }
}
