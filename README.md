# Data-Analytics-Web-App
This is a full-stack web app to analyze data from wikipedia revisioins. Data is analyzied based on articles and authors, simple visualization is also provided.


Before running the server, do the following

Download source files 'revisions' from this google drive link:<br>
https://drive.google.com/open?id=1umyxK0UA7Sa-nvAjZAmOpqaeKYeVpOBE


Move the 'revisions' folder into /app/import/dataset. 

1) Have Mongodb installed, create a database named `wikidata`  
2) Run `npm install` on root directory  
3) cd to /app/import/ and run `node update`. After the update for all 8 user types have been completed, force end the execution (control+c). Then run `node importJSON`.  
4) cd back to root directory, run `npm start`  



