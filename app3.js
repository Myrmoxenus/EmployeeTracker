//Dependencies
const { table } = require('console')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
const fs = require('fs')
const mysql = require('mysql')
const inquirer = require('inquirer')



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

//Renders a table that is a subset of a different table showing all members of the table that have the specified value for a specified field
function renderSubTable(tableName, fieldToFilterBy, valueToFilterBy){
    let query = 'SELECT * FROM ' + tableName + ' WHERE ' + fieldToFilterBy + ' = ' + correctString(valueToFilterBy)
    db.query(query, (err, res) => {
        if (err){
            throw err
        } 
            console.table(res)
        })
}

//Produces every distinct value of manager ID
function allManagerIDs(){
let query = 'SELECT DISTINCT manager_id FROM employee'
        db.query(query, (err, res) => {
        if (err){
            throw err
        } 
            arrayOfManagerIDs=[]
            for(h=0; h<res.length;h++){
            arrayOfManagerIDs.push(res[h].manager_id)
        }
        })
}

//View total sum of employee salaries by department
//I now realize this was a masochistic way of solving this problem.
/*function sumSalaries(departmentID){
    //Generates a list of role IDs assosciated with provided department ID
    let query1 = 'SELECT DISTINCT id FROM roles WHERE department_id = ' + departmentID
    db.query(query1, (err, res) => {
        if (err){
            throw err
        } 
        //Generates an an array that stores pairs of values, the first is the role ID, the second is the number of employees in that role
        let ArrayOfRoleCountPairs = []
            for(z=0;z<res.length;z++){
            //creates a new object to store pairs of role ID and number of employees in that role
            let roleIDcountPair = new Object 
            roleIDcountPair.roleID =  res[z].id
            //queries employee table for number of employees in role
            let query2 = 'SELECT COUNT(*) FROM employee WHERE role_id = ' + res[z].id
            db.query(query2, (err, res) => {
                if (err){
                    throw err
                } 
            roleIDcountPair.numberOfEmployees = res[0]['COUNT(*)']
            ArrayOfRoleCountPairs.push(roleIDcountPair)
            })
            let query3 = 'SELECT salary FROM roles WHERE role_id = ' + ArrayOfRoleCountPairs[0]
            db.query(query3, (err, res) => )
        } 
    })
}
*/

function resume(){
inquirer
  .prompt([
    /* Pass your questions in here */
{
    type: 'confirm',
    name: 'continue',
    message: 'Perform another action?'

}
  ])
  .then(answers => {
    if(answers.continue){
    start()
    }
    else{
        process.exit(1)
    }
    
  })
}


//add departments roles employees
//view departments roles and employees
//update employee roles
//update employee managers
//view employees by manager
//delete departments roles employees
//view total cost of a department

function start(){
inquirer
.prompt([
{
type: 'list',
name: 'Action',
message: 'What would you like to do?',
choices: ["View Employees", "View Roles", "View Departments", "View Employees by Manager", "View Total Cost of a Department", "Add an Employee",
  "Add a Role", "Add a Department", "Update an Employee Manager", "Delete an Employee", "Delete a Role", "Delete a Department", ]
}
])
.then(answers => {
    if(answers.Action == "View Employees"){
        renderTable("employee")
        //Timer to delay question so that it doesn't disrupt the table's formatting
        setTimeout(resume, 200)
    }
    if(answers.Action == "View Roles"){
        renderTable("roles")
        setTimeout(resume, 200)
    }
    if(answers.Action == "View Departments"){
        renderTable("department")
        setTimeout(resume, 200)
    }
    if(answers.Action == "View by Manager"){
        
    }
    if(answers.Action == "View Total Cost of a Department"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Add an Employee"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Add a Role"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Add a Department"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Update an Employee Manager"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Delete an Employee"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Delete a Role"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Delete a Department"){
        console.log("coming soon!")
        resume()
    }
    

})
  .catch(error => {
    if(error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  });
}

//start()

