# Data-Analytics-Web-App
This is a full-stack web app to analyze data from wikipedia revisioins. Data is analyzied based on articles and authors, simple visualization is also provided.
The web app uses plain HTML and bootstrap, MVC framework, node.js and mongodb.
<img src="./app/public/images/screenshot_landing_page.png" width="500" alt="landing page">

<br>
<br>
## To run app: ##  

1) Have Mongodb installed, create a database named `wikidata`   
Screenshot is provided using Robo3T: <img src="./app/public/images/screenshot_create_database.png" width="200" alt="create database">
2) Run `npm install` on root directory  
3) cd to /app/import/ and run `node update`. After the update for all 8 user types have been completed, force end the execution (control+c). Then run `node importJSON`.  
4) cd back to root directory, run `npm start`  



