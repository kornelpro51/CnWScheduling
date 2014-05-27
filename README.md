CnWScheduling
=============

Curds and Wine Scheduling App

step 1: install node and npm
step 2: install bower

    npm install -g bower

step 3: install bower components and node-packages.

    bower install
    npm install

step 4: create mysql database.
   
   database dump file is exist in ./db/scheduler.sql

step 5: configuar your settings.

   config/config.js contains information for system.
   please make correct the db connection parameters.

step 6: run your app.

   method 1: node app.js          //recommend this method
   method 2: nodemon app.js
   method 3: forever app.js