//Dependencies
const { table } = require('console')
const fs = require('fs')
const mysql = require('mysql')


// Creates a connection to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'password',
    database:'employeeTracker',
})

//Connects to MySQL
db.connect((err)=>{
    if(err){
        throw err    
    }
    console.log("MySQL Connected!")
})

// Takes a table's name as an argument and renders it in the terminal
function renderTable(tableName){
    query = 'SELECT * FROM ' + tableName
    db.query(query, (err, res) => {
    if (err){
        throw err
    } 
        console.table(res)
    })
}


renderTable('employee')
renderTable('department')
renderTable('roles')