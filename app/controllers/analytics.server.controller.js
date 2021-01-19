var express = require('express');
var Revision = require('../models/revision');
var Registration = require('../models/registration');
var https = require('https');
var fs = require('fs');
var pathModule = require('path');

var path = pathModule.join(process.cwd(),'app/import/dataset/');
var admin_active = fs.readFileSync(path + 'admin_active.txt').toString().split("\n");
var admin_former = fs.readFileSync(path + 'admin_former.txt').toString().split("\n");
var admin_inactive = fs.readFileSync(path + 'admin_inactive.txt').toString().split("\n");
var admin_semi_active = fs.readFileSync(path + 'admin_semi_active.txt').toString().split("\n");
var bot = fs.readFileSync(path + 'bot.txt').toString().split("\n");

var nodisplay = "display: none;";
var showdisplay = "display: block;";

//When logout
module.exports.logout = function(req, res) {
  console.log("logout function ran!");
  req.session.destroy();
  var loginerrormsg = "You have logged out from the system.";
  var errormsg = req.app.locals.errormsg;
  getIndex(req, res, loginerrormsg, errormsg, nodisplay, showdisplay);
}

//When login or register forms are submitted
module.exports.loginRegister = function(req, res) {
  console.log("loginRegister is ran!");
  var body = req.body;
  var sess = req.session;
  console.log(sess);

  //If login form is posted
  if(body.formtype == "login"){
    Registration.loginCheck(body.loginemail, body.loginpassword, function(err,result){
      if(err){console.log(err);}
      else{
        if(result == 1){
          console.log("Logged in successfully!");
          sess.login = body.loginemail;
          getMain(req,res);
        }
        else{
          var loginerrormsg = "Email or Password is invalid. Please input again.";
          var errormsg = req.app.locals.errormsg;
          getIndex(req, res, loginerrormsg, errormsg, nodisplay, showdisplay);
        }
      }
    });
  }

  //If registration form is posted
  if(body.formtype == "registration"){
    Registration.userExist(body.email, function(err,result){
      if(err){console.log(err);}
      else{
        console.log(result);
        if(result > 0){
          var loginerrormsg = req.app.locals.loginerrormsg;
          var errormsg = "This email is already existed. Please input new email address or Login if you have already registered";
          getIndex(req, res, loginerrormsg, errormsg, showdisplay, nodisplay);
        }
        else{
          Registration.addNewUser(body, function(err,result){
            if(err){console.log(err);}
            else{
              console.log("Registration Info Submitted Successfully!");
              sess.login = body.email;
              getMain(req,res);
            }
          });
        }
      }
    });
  }
}

//When GET '/', check if user is in session and render page
module.exports.showForm = function(req, res) {
  sess = req.session;
  console.log(sess);
  //If login session is still valid, enter main page
  if(sess && "login" in sess){
    console.log("user is still in session");
    getMain(req, res);
  }
  else{
    //If not, render login/registration page
    console.log("user not in session");
    var loginerrormsg = req.app.locals.loginerrormsg;
    var errormsg = req.app.locals.errormsg;
    getIndex(req, res, loginerrormsg, errormsg, nodisplay, showdisplay);
  }
};

//Render login/registration page
function getIndex(req, res, loginerrormsg, errormsg, registrationdisplay, logindisplay){
  console.log("get index ran!");
  var allResult = {};
  allResult.loginerrormsg = loginerrormsg;
  allResult.errormsg = errormsg;
  allResult.inputemail = req.app.locals.inputemail;
  allResult.inputfirstname = req.app.locals.inputfirstname;
  allResult.inputlastname = req.app.locals.inputlastname;
  res.render('index.ejs', {allResult:allResult, registrationdisplay:registrationdisplay, logindisplay:logindisplay});
}

//When GET '/main', check if user is in session and render page
module.exports.showMain = function(req, res) {
  console.log("showMAIN ran");
  sess = req.session;
  console.log(sess);
  if(sess && "login" in sess){
    getMain(req, res);
  }
  else{
    console.log("Not in session");
    var loginerrormsg = req.app.locals.loginerrormsg;
    var errormsg = req.app.locals.errormsg;
    getIndex(req, res, loginerrormsg, errormsg, nodisplay, showdisplay);
  }
};

//Get query results and render main page
function getMain(req, res){
  console.log("getMain rannnn!!!!!!!");
  var allResult = {};
  var count = 0;

  sess = req.session;
  allResult.email = sess.login;

  //OVERALL Analytics
  //Find 2 articles with most number of revisions
  Revision.findMostNumRev(2, function(err, result){
    if(err){console.log(err);}
    else{
      console.log('result', result);
      
      allResult.mostNumRev1 = result[0]._id;
      allResult.mostNumRev2 = result[1]._id;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Find 2 articles with least number of revisions
  Revision.findLeastNumRev(2, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.leastNumRev1 = result[0]._id;
      allResult.leastNumRev2 = result[1]._id;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Find an article that are revised by largest group of registered users
  Revision.findLargestRegisteredUsers(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.largestRegUserRev = result[0]._id;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Find an article that are revised by smallest group of registered users
  Revision.findSmallestRegisteredUsers(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.smallestRegUserRev = result[0]._id;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Find an article with the oldest age
  Revision.findLongestHistory(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.longestHistory1 = result[0]._id;
      allResult.longestHistory2 = result[1]._id;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Find an article with the youngest age
  Revision.findYoungestHistory(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.youngestHistory = result[0]._id;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Get the revision number distribution by year and by user type across the whole data set for Bar chart
  Revision.overallBarChart(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.overallBarChart = result;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Get the revision number distribution by user type across the whole data set for Pie chart
  Revision.overallPieChart(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.overallPieChart = result;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Get number of revisions by type of admin for Pie chart
  Revision.overallRevAdminType(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.overallRevAdminType = result;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });

  //Get all the article names for drop down list
  Revision.articleDropDownList(function(err, result){
    if(err){console.log(err);}
    else{
      allResult.articleDropDownList = result;
      count++;
      parseAllResult(allResult, res, count, 'main.ejs');
    }
  });
}

//Sending Overall Data Analytics result back to browser: Before rendering, check that all the functions have been run with count and then render to Main
function parseAllResult(allResult, res, count, viewfile){
  console.log(count);
  if(count < 10){return;}
  else{
    allResult.individualdisplay = nodisplay;
    allResult.authordisplay = nodisplay;
    res.render(viewfile, {allResult: allResult});
  }
}

//Get top # articles with highest/lowest revisions and render to highLowRevResult.ejs to be put in main.ejs section
module.exports.getHighLowRev = function(req, res) {
  var allResult = {};
  allResult.mostNumRev = [];
  allResult.leastNumRev = [];
  var count = 0;
  var numberofarticle = parseInt(req.query.numberofarticle);
  //Get # articles with highest number of revision
  Revision.findMostNumRev(numberofarticle, function(err, result){
    if(err){console.log(err);}
    else{
      for(var i=0;i<numberofarticle;i++){
        allResult.mostNumRev[i] = result[i]._id;
      }
      allResult.numberOfArticle = numberofarticle;
      count++;
      parseHighLowRevResult(allResult, res, count, 'highLowRevResult.ejs');
    }
  });
  //Get # articles with lowest number of revision
  Revision.findLeastNumRev(numberofarticle, function(err, result){
    if(err){console.log(err);}
    else{
      for(var i=0;i<numberofarticle;i++){
        allResult.leastNumRev[i] = result[i]._id;
      }
      count++;
      parseHighLowRevResult(allResult, res, count, 'highLowRevResult.ejs');
    }
  });
};

//Sending results of # articles with highest/lowest revisions back as respond and render
function parseHighLowRevResult(allResult, res, count, viewfile){
  if(count < 2){return;}
  else{res.render(viewfile, {allResult: allResult});}
}

//Get Individual data analytics results and render to individualArticleResult.ejs
module.exports.showIndividualResult = function(req, res) {
  var wikiEndpointHost = "en.wikipedia.org",
  path = "/w/api.php"
  parameters = [
    "action=query",
    "format=json",
    "prop=revisions",
    "rvdir=newer",
    "rvlimit=max",
    "rvprop=timestamp|userid|user|ids"],
  headers = {
    Accept: 'application/json',
    'Accept-Charset': 'utf-8'
  }
  var options;

  var allResult = {};
  var title = req.query.title;
  parameters.push("titles=" + encodeURIComponent(title));
  allResult.individualTitle = title;
  var latestRevTime;
  var count = 0;

  Revision.findTitleLatestRev(title, function(err, result){
    if(err){console.log(err);}
    else{
      latestRevTime = result[0].timestamp;
      parameters.push("rvstart=" + latestRevTime);
      var fullPath = path + "?" + parameters.join("&");
      options = {
          host: wikiEndpointHost,
          path: fullPath,
          headers: headers
      };

      //Compare timestamp if article is older than one day
      var currentDate = new Date();
      var articleLatestRev = new Date(latestRevTime);
      console.log("current: " + currentDate.toISOString() + " Articlate Rev: " + result[0].timestamp);
      var dateDiff = currentDate - articleLatestRev;
      var oneDay = 24 * 60 * 60 * 1000;
      //console.log(dateDiff + " compare " + oneDay);
      if(dateDiff < oneDay){
        //ALREADY UPDATED
        allResult.updateMsg = "The data is Up-to-Date!";
        count++;
        parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');
        getIndividualResult(title, res, allResult, count);

      }
      else{
        //NOT UPDATED
        console.log("not updated");

        //Request for revisions info from Wikipedia
        pullWikiData(options, function(revisions){
            allResult.updateMsg = "There are " + revisions.length + " new revisions. The articles data have been updated!";
            count++;
            parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');

            //Set usertype, admintype, registered fields for updated users
            for(var i in revisions){
              revisions[i].title = title;
              //console.log(revisions[i]);
              if(revisions[i].hasOwnProperty("anon")){
                revisions[i].usertype = "anon";
                revisions[i].registered = false;
              }
              else if(admin_active.indexOf(revisions[i].user) > -1){
                revisions[i].usertype = "admin";
                revisions[i].admintype = "active";
                revisions[i].registered = true;
              }
              else if(admin_former.indexOf(revisions[i].user) > -1){
                revisions[i].usertype = "admin";
                revisions[i].admintype = "former";
                revisions[i].registered = true;
              }
              else if(admin_inactive.indexOf(revisions[i].user) > -1){
                revisions[i].usertype = "admin";
                revisions[i].admintype = "inactive";
                revisions[i].registered = true;
              }
              else if(admin_semi_active.indexOf(revisions[i].user) > -1){
                revisions[i].usertype = "admin";
                revisions[i].admintype = "semi-active";
                revisions[i].registered = true;
              }
              else if(bot.indexOf(revisions[i].user) > -1){
                revisions[i].usertype = "bot";
                revisions[i].registered = true;
              }
              else{
                revisions[i].usertype = "regular";
                revisions[i].registered = false;
              }
            }
            //Insert data to mongoDB
            Revision.addData(revisions, function(err, result){
              if(err){console.log(err);}
              else{
                getIndividualResult(title, res, allResult, count);
              }
            });
          });
        }
      }
    });
}

// Check all queries of individual analytics results are run before render
function parseIndividualResult(allResult, res, count, viewfile){
  console.log(count);
  if(count < 7){return;}
  else{
    res.render(viewfile, {allResult: allResult});
  }
}

//Get new revisions data from Wikipedia
pullWikiData = function(options, callback){
  console.log("pullwiki data function ran!!");
  https.get(options,function(res){
      var data ='';
      res.on('data',function(chunk){
          data += chunk;
      })
      res.on('end',function(){
          json = JSON.parse(data);
          pages = json.query.pages;
          revisions = pages[Object.keys(pages)[0]].revisions;
          revisions.splice(0, 1)
          //console.log(revisions);
          console.log("There are " + revisions.length + " new revisions.");
          var users=[]
          for (revid in revisions){
              users.push(revisions[revid].user);
          }
          uniqueUsers = new Set(users);
          console.log("The new revisions are made by " + uniqueUsers.size + " unique users");
          callback(revisions);
      })
  }).on('error',function(e){
      console.log(e);
  })
}

// Get all individual analytics query results
function getIndividualResult(title, res, allResult, count){
  //Get number of revisions of the article
  Revision.articleRevNumber(title, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.articleRevNumber = result;
      count++;
      parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');
    }
  });

  //Get top 5 regular users that made most revisions on the article
  Revision.top5RegUsers(title, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.top5users = [];
      //allResult.top5RegUsers1 = result[0];
      for(var i=0;i<result.length;i++){
        allResult.top5users[i] = result[i]._id;
      }
      count++;
      parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');
    }
  });

  //Get revision number distributed by year and by user type for this article for bar chart
  Revision.articleBarChart(title, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.articleBarChart = result;
      count++;
      parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');
    }
  });

  //Get revision number distribution based on user type for this article for pie chart
  Revision.articlePieChart(title, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.articlePieChart = result;
      count++;
      parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');
    }
  });

  //Get number of revisions by type of admin for Pie chart
  Revision.articleAdminType(title, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.articleAdminType = result;
      count++;
      parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');
    }
  });

  //Get year list for year range selection
  Revision.articleYearList(title, function(err, result){
    if(err){console.log(err);}
    else{
      for(var i=0;i<result.length;i++){
        for(var j=0;j<result.length-i-1;j++){
            if(result[j]._id > result[j+1]._id){
              //console.log("swap" + result[j]._id + " " + result[j+1]._id);
              var temp = result[j]._id;
              result[j]._id = result[j+1]._id;
              result[j+1]._id = temp;
            }
        }
      }
      allResult.articleYearList = result;

      count++;
      parseIndividualResult(allResult, res, count, 'individualArticleResult.ejs');
    }
  });
}

//Get revision number distributed by year made by one or a few of the top 5 users for this article and render
module.exports.getIndividualBarChartTop5 = function(req, res) {
  var title = req.query.title;
  var topusers = req.query.topusers;
  var from = req.query.from;
  var yearfrom = (parseInt(from) - 1).toString();
  var to = req.query.to;
  var yearto = (parseInt(to) + 1).toString();
  //console.log("on server: " + topusers + " " + from + " " + to);
  var allResult = {};
  var usersArray = topusers.split(',');

  Revision.articleBarChartTop5(title, usersArray, yearfrom, yearto, function(err, result){
    if(err){console.log(err);}
    else{
      //console.log(result);
      allResult.usersArray = usersArray;
      allResult.articleBarChartTop5 = result;
      var arraytemp = [];
      for(var i=0;i<usersArray.length;i++){
        arraytemp.push(usersArray[i]);
      }

      for(var i=0;i<result.length;i++){
        for(var j=0;j<arraytemp.length;j++){
          if(result[i].user == arraytemp[j]){
            arraytemp.splice(j,1);
            j--;
          }
        }
      }
      if(arraytemp.length == 0){
        //console.log("user completed!");
        allResult.top5error = "";
      }
      else{
        //console.log("user not complete");
        allResult.top5error = "The graph could not be constructed because one or more authors do not have revision records in the year range selected. Please select a bigger range of years.";
      }

      res.render('finalBarChartTop5.ejs', {allResult: allResult});
    }
  });
}

//Get author analytics results and render
module.exports.showAuthorResult = function(req, res) {
  var user = req.query.user;
  allResult = {};
  //console.log("On server: " + user);

  Revision.authorAnalytics(user, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.authorAnalytics = result;
      allResult.authorErrorMsg = "";
      if(result === undefined || result.length == 0){
        console.log("result is null");
        allResult.authorErrorMsg = "Author is not found. Please input the author's name again.";
      }
      res.render('authorAnalyticsResult.ejs', {allResult: allResult});
    }
  });
}

//Get list of timestamps of all revisions made by a user on an article and render
module.exports.showTimestampResult = function(req, res) {
  var user = req.query.user;
  var title = req.query.title;
  allResult = {};
  //console.log("On server: " + user + " " + title);

  Revision.getTimestamp(user, title, function(err, result){
    if(err){console.log(err);}
    else{
      allResult.timestampResult = result;
      res.render('timestampResult.ejs', {allResult: allResult});
    }
  });
}
