google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawArticleBarChartTop5Users);

function drawArticleBarChartTop5Users(){
  var array = [['Year', 'Number of revisions']];
  if (typeof articleBarChartTop5 === 'undefined'){
    //console.log("do nothing");
  }
  else{
    var jsondata = {};
    var arr = [];
    arr.push('Year');
    usersArray.forEach(function(field){
      arr.push(field);
    });

    articleBarChartTop5.forEach(function(field){
      if(!jsondata[field.year]){
        jsondata[field.year] = {};
      }
      //console.log(field.year + " " + field.user + " " + field.numbOfRev);
      jsondata[field.year][field.user] = parseInt(field.numbOfRev);
    })

    var bar = [];
    bar.push(arr);
    //console.log(bar);
    for(var row in jsondata){
      var barRow = [row];
      for(var i=0;i<usersArray.length;i++){
        barRow.push(jsondata[row][usersArray[i]]);
      }
      bar.push(barRow);
    }

    var data = google.visualization.arrayToDataTable(bar);

    var options = {
      'width': 900,
      'height': 500,
      colors: ['#bf5f5f', '#ffafaf', '#ff9b41', '#bb245f', '#7e5dc3'],
      'title': "Revision number distributed by year made by one or a few of the top 5 users for this article",
      hAxis: {
        title: 'timestamp'
      }
    };
    var chart = new google.visualization.ColumnChart($("#articleBarChartTop5Section")[0]);
    chart.draw(data, options);
  }
}
