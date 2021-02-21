//Dependencies
const { table } = require('console')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
const fs = require('fs')
const mysql = require('mysql')

var columnArray = []

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
    let query = 'SELECT * FROM ' + tableName
    db.query(query, (err, res) => {
    if (err){
        throw err
    } 
        console.table(res)
    })
}

//Returns an array containing the names of every column in a table
function generateColumnList(tableName){
    let query = 'SHOW COLUMNS FROM ' + tableName
    columnArray2 = db.query(query, (err, res) => {
    if(err){
        throw err
    }
    //Starts at 1 to exclude id
    let columnArray = []
    for(i=1; i<res.length; i++){
        columnArray2.push(res[i].Field)
    }
    return columnArray
    })
    return columnArray2
}
//
function addToTable(tableName, ...columnData){
    let query = 'INSERT INTO ' + tableName + '(' + columnArray.join() + ')' +
                'VALUES' + '(' + columnData.join() + ')'
    db.query(query, (err, res) => {
    if(err){
        throw err
    }})
}


//renderTable("roles")
console.log(generateColumnList("roles"))
