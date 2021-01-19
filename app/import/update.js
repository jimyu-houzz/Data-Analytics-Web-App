var mongoose = require('mongoose');
var fs = require('fs');
var express = require('express');
var pathModule = require('path');

var path = pathModule.join(process.cwd(),'dataset/');
var admin_active = fs.readFileSync(path + 'admin_active.txt').toString().split("\n");
var admin_former = fs.readFileSync(path + 'admin_former.txt').toString().split("\n");
var admin_inactive = fs.readFileSync(path + 'admin_inactive.txt').toString().split("\n");
var admin_semi_active = fs.readFileSync(path + 'admin_semi_active.txt').toString().split("\n");
var bot = fs.readFileSync(path + 'bot.txt').toString().split("\n");
var allAdmin = admin_active.concat(admin_former, admin_inactive, admin_semi_active);
var allRegisteredUser = allAdmin.concat(bot);
//console.log(allRegisteredUser);

mongoose.connect('mongodb://localhost/wikidata', 
  { useNewUrlParser: true, useUnifiedTopology: true },
  function () {
	  console.log('mongodb connected to wikidata!')
	});

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

var Revision = mongoose.model('Revision', RevisionSchema, 'revisions');

//Set usertype for all admin users
Revision.update(
  {'user':{'$in':allAdmin, '$nin':bot}},
  {$set:{usertype:'admin',registered:true}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR", err)}
  else{
    console.log('admin usertype has been updated/inserted');
    console.log(result);
  }}
);

//Set type of Active admin for all admin_active users
Revision.update(
  {'user':{'$in':admin_active, '$nin':bot}},
  {$set:{admintype:'active'}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR", err)}
  else{
    console.log('admin_active admintype has been updated/inserted');
    console.log(result);
  }}
);

//Set type of Former admin for all admin_former users
Revision.update(
  {'user':{'$in':admin_former, '$nin':bot}},
  {$set:{admintype:'former'}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR")}
  else{
    console.log('admin_former admintype has been updated/inserted');
    console.log(result);
  }}
);

//Set type of Inactive admin for all admin_inactive users
Revision.update(
  {'user':{'$in':admin_inactive, '$nin':bot}},
  {$set:{admintype:'inactive'}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR")}
  else{
    console.log('admin_inactive admintype has been updated/inserted');
    console.log(result);
  }}
);

//Set type of Semi-active admin for all admin_semi_active users
Revision.update(
  {'user':{'$in':admin_semi_active, '$nin':bot}},
  {$set:{admintype:'semi-active'}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR")}
  else{
    console.log('admin_semi_active admintype has been updated/inserted');
    console.log(result);
  }}
);

//Update for all bot users with user type being bot
Revision.update(
  {'user':{'$in':bot}},
  {$set:{usertype:'bot',registered:true}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR")}
  else{
    console.log('bot usertype has been updated/inserted');
    console.log(result);
  }}
);

//Update for all anonymous users with user type being anon
Revision.update(
  {'anon':{$exists:true}},
  {$set:{usertype:'anon',registered:false}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR")}
  else{
    console.log('anon usertype has been updated/inserted');
    console.log(result);
  }}
);

//Update for all other users with user type being regular user
Revision.update(
  {'user':{'$nin':allRegisteredUser},'anon':{$exists:false}},
  {$set:{usertype:'regular',registered:true}},
  {multi: true, upsert:true},
  function(err,result){
  if (err){console.log("ERROR")}
  else{
    console.log('regular usertype has been updated/inserted');
    console.log(result);
  }}
);

//mongoose.disconnect();
