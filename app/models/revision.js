var mongoose = require('./db');
var fs = require('fs');

var RevisionSchema = new mongoose.Schema({
	title: String,
	timestamp:String,
	user:String,
	anon:String,
	usertype:String,
	registered:Boolean,
	admintype:String
},{
	versionKey: false
});



//Overall #1 : Title of 2 articles with highest number of revisions
RevisionSchema.statics.findMostNumRev = function(number, callback){
	var query = [
		{$group: {_id:"$title", numOfRevisions:{$sum:1}}},
		{$sort: {numOfRevisions:-1}},
		{$limit: number}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Overall #2 : Title of 2 articles with lowest number of revisions
RevisionSchema.statics.findLeastNumRev = function(number, callback){
	var query = [
		{$group: {_id:"$title", numOfRevisions:{$sum:1}}},
		{$sort: {numOfRevisions:1}},
		{$limit: number}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Overall #4 : The article edited by largest group of registered users. Each wiki article is edited by a number of users, some making multiple revisions. The number of unique users is a good indicator of an article’s popularity.
RevisionSchema.statics.findLargestRegisteredUsers = function(callback){
	var query = [
		{$match:{
    	anon:{$exists:false},
    	registered:{$exists:true}
    }},
		{$group:{_id:{title:"$title",user:"$user"}}},
		{$group:{_id:"$_id.title",count:{$sum:1}}},
		{$sort:{count:-1}},
  	{$limit:1}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Overall #5 : The article edited by smallest group of registered users.
RevisionSchema.statics.findSmallestRegisteredUsers = function(callback){
	var query = [
		{$match:
			{anon:{$exists:false},
    	registered:{$exists:true}
		}},
		{$group:{_id:{title:"$title",user:"$user"}}},
		{$group:{_id:"$_id.title",count:{$sum:1}}},
		{$sort:{count:1}},
  	{$limit:1}
	]
	return this.aggregate(query)
	.exec(callback)
}


//Overall #6 : The top 2 articles with the longest history (measured by age)
RevisionSchema.statics.findLongestHistory = function(callback){
	var query = [
		{$group: {_id: "$title", timestamp: {"$min": "$timestamp"}}},
		{$sort: {timestamp: 1}},
	  {$limit: 2}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Overall #7 : Article with the shortest history (measured by age)
RevisionSchema.statics.findYoungestHistory = function(callback){
	var query = [
		{$group: {_id: "$title", timestamp: {"$min": "$timestamp"}}},
		{$sort: {timestamp: -1}},
	  {$limit: 1}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Overall #8 : Bar chart of revision number distribution by year and by user type across the whole data set
RevisionSchema.statics.overallBarChart = function(callback){
	var query = [
		{$project: {
			year: {$substr: ["$timestamp", 0, 4]},
			usertype: "$usertype"
		}},
    {$group: {_id: {year:"$year", usertype:"$usertype"}, numbOfRev: {$sum: 1}}},
    {$project: {
			_id: 0,
			year: "$_id.year",
			usertype:"$_id.usertype",
      numbOfRev: "$numbOfRev"
    }},
		{$sort: {"year": 1}}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Overall #9 : Pie chart of revision number distribution by user type across the whole data set
RevisionSchema.statics.overallPieChart = function(callback){
	var query = [
		{$group: {_id: {usertype:"$usertype"}, numbOfRev: {$sum: 1}}},
    {$project: {
				_id: 0,
				usertype:"$_id.usertype",
        numbOfRev: "$numbOfRev"
    }}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Overall #9 : Get number of revisions by type of admin
RevisionSchema.statics.overallRevAdminType = function(callback){
	var query = [
		{$match:{usertype : "admin"}},
    {$group: {_id: "$admintype", numbOfRev: {$sum: 1}}},
    {$project: {
				admintype:"$admintype",
        numbOfRev: "$numbOfRev"
    }}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Individual Article: Dropdown List
RevisionSchema.statics.articleDropDownList = function(callback){
	return this.distinct("title")
	.exec(callback)
}

//Individual Article: check latest revision time
RevisionSchema.statics.findTitleLatestRev = function(title, callback){
	return this.find({'title':title}).sort({'timestamp':-1}).limit(1).exec(callback)
}

//Individual Article #2: Total number of revisions
RevisionSchema.statics.articleRevNumber = function(title, callback){
	return this.find({'title':title}).count().exec(callback)
}

//Individual Article #3: Top 5 regular users ranked by total revision numbers on this article, and the respective revision numbers
RevisionSchema.statics.top5RegUsers = function(title, callback){
	var query = [
		{$match: {"title": title}},
		{$group: {_id: "$user", numbOfRev:{$sum:1}}},
		{$sort: {numbOfRev:-1}},
		{$limit: 5}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Update data after calling API
RevisionSchema.statics.addData = function(wikiData, callback){
	var empty = true;
	for(var i in wikiData){
		if(wikiData.hasOwnProperty(i)){
			empty = false;
		}
	}
	if(!empty){
		console.log(wikiData);
		return this.insertMany(wikiData, function(err, result){
			if(err){console.log(err);}
			//console.log(result);
			callback();
		});
	}
	else{
		return callback()
	}
}

//Individual Article #4: Bar chart of revision number distributed by year and by user type for this article
RevisionSchema.statics.articleBarChart = function(title, callback){
	var query = [
		{$match: {"title": title}},
		{$project: {
			year: {$substr: ["$timestamp", 0, 4]},
			usertype: "$usertype"
		}},
    {$group: {_id: {year:"$year", usertype:"$usertype"}, numbOfRev: {$sum: 1}}},
    {$project: {
			_id: 0,
			year: "$_id.year",
			usertype:"$_id.usertype",
      numbOfRev: "$numbOfRev"
    }},
		{$sort: {"year": 1}}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Individual Article #5: Pie chart of revision number distribution based on user type for this article
RevisionSchema.statics.articlePieChart = function(title, callback){
	var query = [
		{$match: {"title": title}},
		{$group: {_id: {usertype:"$usertype"}, numbOfRev: {$sum: 1}}},
    {$project: {
				_id: 0,
				usertype:"$_id.usertype",
        numbOfRev: "$numbOfRev"
    }}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Individual Article #5: Get number of revisions of this article by type of admin
RevisionSchema.statics.articleAdminType = function(title, callback){
	var query = [
		{$match:{"title": title, usertype : "admin"}},
    {$group: {_id: "$admintype", numbOfRev: {$sum: 1}}},
    {$project: {
				admintype:"$admintype",
        numbOfRev: "$numbOfRev"
    }}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Individual Article #6: Bar chart of revision number distributed by year made by one or a few of the top 5 users for this article
RevisionSchema.statics.articleBarChartTop5 = function(title, usersArray, from, to, callback){
	console.log(from + " " + to);
	var query = [
		{$match: {"title": title, "user": {'$in': usersArray}}},
		{$project: {
			year: {$substr: ["$timestamp", 0, 4]},
      user: "$user"
		}},
		{$match: {year: {$gt:from, $lt:to}}},
		{$group: {_id: {year:"$year", user:"$user"}, numbOfRev: {$sum:1}}},
    {$project:{
      _id:0,
      year: "$_id.year",
      user: "$_id.user",
      numbOfRev: "$numbOfRev"
      }},
		{$sort: {"year": 1}}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Individual Article #6: Get year list for year range input
RevisionSchema.statics.articleYearList = function(title, callback){
	var query = [
		{$match: {"title": title}},
    {$project: {year: {$substr: ["$timestamp", 0, 4]}}},
    {$group: {_id: "$year"}},
    {$sort: {"year": 1}}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Author Analytics: Get article list and number of revision by user
RevisionSchema.statics.authorAnalytics = function(user, callback){
	var query = [
		{$match: {"user": user}},
		{$group: {_id: "$title", numbOfRev: {$sum:1}}},
    {$project: {
    	title: "$_id.title",
    	numbOfRev: "$numbOfRev"}},
		{$sort: {"_id": 1}}
	]
	return this.aggregate(query)
	.exec(callback)
}

//Author Analytics: Get timestamp list of an article by user
RevisionSchema.statics.getTimestamp = function(user, title, callback){
	var query = [
		{$match: {"user": user, "title": title}},
    {$project: {
      _id: 0,
      title: "$title",
      timestamp: "$timestamp"}},
		{$sort: {"_id": 1}}
	]
	return this.aggregate(query)
	.exec(callback)
}

var Revision = mongoose.model('Revision', RevisionSchema, 'revisions')

module.exports = Revision
