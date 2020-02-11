const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reactmysql'
  });

connection.connect(function(err){
    (err) ? console.log(err) : console.log(connection);
  });

  app.get('/api/todolist', (req, res) => {
    var sql = "SELECT * FROM todolist ORDER BY id ASC";
    connection.query(sql, function(err, results) {
      if (err) throw err;
      res.json({todolist: results});
    });
  });

  app.post('/api/getData', (req, res) => {
    var sql = "SELECT todoListContent FROM todolist WHERE id = '"+req.body.id+"'";
    connection.query(sql, function(err, results) {
      if (err) throw err;
      res.json({content: results});
    });
  });

  app.post('/api/updateData', function(req, res) {
    var sql = "UPDATE todolist "
            + "SET todoListContent = '"+req.body.todoListContent+"'"
            + "WHERE id = '"+req.body.id+"'"
    connection.query(sql, function (err, results) {
      if(err) throw err;
      res.json({news: results});
    });
  });



app.listen(4000, () => console.log('App listening on port 4000'));