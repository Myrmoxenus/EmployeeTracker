//Dependencies
const { table } = require('console')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
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
    let query = 'SELECT * FROM ' + tableName
    db.query(query, (err, res) => {
    if (err){
        throw err
    } 
        console.table(res)
    })
}
//Takes an argument and correctly formats it if it's a string for MySQL
function correctString(anArgument){
    if(typeof anArgument == 'string'){
        correctedArgument = "\'" + anArgument + "\'"
    }
    else {
        correctedArgument = anArgument
    }
    return correctedArgument
}

//Takes a table name and a series of arguments 
function addToTable(tableName, ...columnData){
    //Runs all column data arguments through the correctString function
    columnData.forEach((val, index) => columnData[index] = correctString(val))
    let query1 = 'SHOW COLUMNS FROM ' + tableName
    db.query(query1, (err, res) => {
        if(err){
            throw err
        }
        //Starts at 1 to exclude id
        let columnArray = []
        for(i=1; i<res.length; i++){
            columnArray.push(res[i].Field)
        }
        let query2 = 'INSERT INTO ' + tableName + ' (' + columnArray.join() + ') ' +
                     ' VALUES' + ' (' + columnData.join() + ')'
                    db.query(query2, (err, res) => {
                        if(err){
                            throw err
                        }})})
}

//Deletes a from a table based on an ID
function deleteFromTableByID(tableName, id){
    let query = 'DELETE from ' + tableName + ' where id = ' + id
    db.query(query, (err, res) => {
        if (err){
            throw err
        }})
}

//Updates a table with at desired field with desired value where ID equals entered ID
function updateTableByID(tableName, id, fieldToUpdate, newValue){
let query = 'UPDATE ' + tableName + ' SET ' + fieldToUpdate + " = " +  correctString(newValue) + " WHERE id = " + id
db.query(query, (err, res) => {
    if (err){
        throw err
    }})
}

//addToTable("roles", "\'Big Orc\'", 90000, 5)
//updateTableByID("roles", 4, "salary", 22)
//addToTable("roles", "Biggest Orc", 120000, 5)
renderTable("roles")
