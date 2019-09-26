var exec = require("child_process").exec;
const fs = require("fs");
var pathModule = require('path');

var directoryPath = pathModule.join(process.cwd(),'dataset/revisions/');
var importcommand = 'mongoimport --jsonArray --db wikidata --collection revisions --file ' + directoryPath;

//check if directory exist
if(fs.existsSync(directoryPath)){
  console.log("Directory path existed!");
  //read files in directory
  fs.readdir(directoryPath, function(err, filenames){
    if(err){
      console.log(err);
      return;
    }
    filenames.forEach(function(filename){
      //var escapedfilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      //console.log(escapedfilename);
      fs.readFile(directoryPath + filename, 'utf-8', function(err, content){
        if(err){
          console.log(err);
          return;
        }
        console.log("Importing... " + filename);
        exec(importcommand + escapeFileName(filename));
      });
    });
  });
}
else{
  console.log("Directory not found");
}

function escapeFileName(filename){
    var name = "";
    for (var i=0;i<filename.length; i++) {
        if(filename[i].match(/[^a-z0-9.]/gi)){
          //console.log(filename[i]);
            name+="\\"+filename[i];
        }
        else{
            name+=filename[i];
        }
    }
    return name;
}
