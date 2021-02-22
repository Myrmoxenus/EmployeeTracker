//Dependencies

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

//Takes a table name and a series of arguments corresponding to the column names of the desired table
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

//For generating choice lists within inquirer questions from tables
function generateList(tableName, fieldToFilterBy){
    let outputArray = []
    let query = 'SELECT DISTINCT ' + fieldToFilterBy +' FROM ' + tableName
    db.query(query, (err, res) => {
    if (err){
        throw err
    } 
        console.log(res)
        for(h=0; h<res.length;h++){
            eval("outputArray.push(res[h]." + fieldToFilterBy +")")
        }

        })
    return outputArray
}
//Testopresto
function testopresto(){
    outputArray = []
    let query = 'SELECT * FROM employee' //GROUP BY manager_id'
    db.query(query, (err, res) => {
        if (err){
            throw err
        } 
            //console.log(res)
            for(h=0; h<res.length;h++){
                pair = []
                pair.push(res[h].id)
                pair.push(res[h].first_name + ' ' + res[h].last_name)
                outputArray.push(pair)
            }
        })
        return outputArray
}

//Converts a MySQL table to an array of objects to easily navigate in JavaScript
function downloadTable(tableName){
    let outputArray = []
    let query = 'SELECT * FROM ' + tableName
    db.query(query, (err, res) => {
        if (err){
            throw err
        } 
            //console.log(res)
            for(h=0; h<res.length;h++){
                outputArray.push(res[h])
            }
        })
        return outputArray
}




//Class for inquirer questions
class question{
    constructor(...parameters){
        this.type = parameters[0]
        this.name = parameters[1]
        this.message = parameters[2]
        if(parameters[3]){
            this.choices = parameters[3]
        }
    }
}
//Asks the user if they want to make another action to be run after every action, restarts the menu if so, otherwise exits the process
function resume(){
inquirer
  .prompt([
new question('confirm','continue', 'Perform another action?')
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
    //let testArray = testopresto()
    let employeeTable = downloadTable('employee')
    let rolesTable = downloadTable('roles')
    let departmentTable = downloadTable('department')
inquirer
.prompt([
new question ('list','Action', 'What would you like to do?', 
//an Array of all menu items for user actions
["View Employees", "View Roles", "View Departments", "View Employees by Manager", "View Total Cost of a Department", "Add an Employee","Add a Role", "Add a Department", "Update an Employee Manager", "Delete an Employee", "Delete a Role", "Delete a Department",])
])
.then(answers => {
    if(answers.Action == "View Employees"){
        //renderTable("employee")
        console.table(employeeTable)//[0].first_name)
      
        
        setTimeout(resume, 200)}
        if(answers.Action == "View Roles"){
            console.log(rolesTable)
            //renderTable("roles")
            setTimeout(resume, 200)
        }
        if(answers.Action == "View Departments"){
            //renderTable("department")
            console.log(departmentTable)
            setTimeout(resume, 200)
        }
    })}
    
    /*
    if(answers.Action == "View Roles"){
        renderTable("roles")
        setTimeout(resume, 200)
    }
    if(answers.Action == "View Departments"){
        renderTable("department")
        setTimeout(resume, 200)
    }
    if(answers.Action == "View Employees by Manager"){
        let allManagersArray = []
        let query = 'SELECT DISTINCT manager_id FROM employee'
        db.query(query, (err, res) => {
        if (err){
            throw err
        } 
            for(h=0; h<res.length;h++){
            allManagersArray.push(res[h].manager_id)
        }
        selectManager(allManagersArray)
        })
        
    function selectManager(inputArray){
        inquirer
        .prompt([
            new question('list','managerChoice', 'Select Manager ID to view Employees By:', inputArray)
        ])
        .then((answer)=> {
            renderSubTable("employee", "manager_id", answer.managerChoice)
            setTimeout(resume, 200)
        })
    }
    }
    if(answers.Action == "View Total Cost of a Department"){
        console.log("coming soon!")
        resume()
    }
    if(answers.Action == "Add an Employee"){
        console.log("Employee Added!")
        resume()
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
}*/
//start()
start()