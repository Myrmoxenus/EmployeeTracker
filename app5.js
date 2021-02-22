//Dependencies

const mysql = require('mysql')
const inquirer = require('inquirer')
const e = require('express')

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

//For generating choice lists within inquirer questions from tables, throws outputed Array to callback function
function generateList(tableName, fieldToFilterBy, callback){
    let outputArray = []
    let query = 'SELECT DISTINCT ' + fieldToFilterBy +' FROM ' + tableName
    db.query(query, (err, res) => {
    if (err){
        throw err
    }
        for(h=0; h<res.length;h++){
        eval("outputArray.push(res[h]." + fieldToFilterBy +")")
    }
    callback(outputArray)
    })
    }

//Turns an employee name into an assosciated employee ID or takes an employee ID and turns it into an employee name and passes it to a callback function
function transmuteEmployee2(input, callback){
    if(typeof input == 'number'){
        let query = "SELECT * FROM employee WHERE id = " + input
        db.query(query, (err, res) => {
            if (err){
                throw err
            } 
                let employeeName = res[0].first_name + ' ' + res[0].last_name
                callback(employeeName)
            })
    }
    else{
        let nameArray = input.split(" ") 
        let query = 'SELECT * FROM employee WHERE first_name = ' + correctString(nameArray[0]) + ' AND last_name = ' + correctString(nameArray[1])
        db.query(query, (err, res) => {
            if (err){
                throw err
            } 
                callback(res[0].id)
            })
    }
}

//Turns an employee name into an assosciated employee ID or takes an employee ID and turns it into an employee name and passes it to a callback function
function transmuteEmployee(input){
    if(typeof input == 'number'){
        let query = "SELECT * FROM employee WHERE id = " + input
        db.query(query, (err, res) => {
            if (err){
                throw err
            } 
                let employeeName = res[0].first_name + ' ' + res[0].last_name
                return employeeName
            })
    }
    else{
        let nameArray = input.split(" ") 
        let query = 'SELECT * FROM employee WHERE first_name = ' + correctString(nameArray[0]) + ' AND last_name = ' + correctString(nameArray[1])
        db.query(query, (err, res) => {
            if (err){
                throw err
            } 
                return res[0].id
            })
    }
}

//Turns an array of employee IDs into an array of Employee names and then executes a callback function on it
function employeesFromIDs(idArray, nameArray, callback){
    if(idArray.length == 0){
        return callback(nameArray)
    }
    else{
    let query = "SELECT * FROM employee WHERE id = " + idArray[0]
    db.query(query, (err, res) => {
        if (err){
            throw err
        } 
            let employeeName ='ID: ' + idArray[0] + ' NAME: ' + res[0].first_name + ' ' + res[0].last_name 
            nameArray.push(employeeName)
            employeesFromIDs(idArray.slice(1),nameArray,callback)
        })
}

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
inquirer
.prompt([
new question ('list','Action', 'What would you like to do?', 
//an Array of all menu items for user actions
["View Employees", "View Roles", "View Departments", "View Employees by Manager", "View Total Cost of a Department", "Add an Employee","Add a Role", "Add a Department", "Update an Employee Manager", "Delete an Employee", "Delete a Role", "Delete a Department",])
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
    if(answers.Action == "View Employees by Manager"){
        generateList('employee', 'manager_id', makeNames)
        function makeNames(inputArray){
            employeesFromIDs(inputArray, [], selectManager)
        }
        function selectManager(inputArray){
        inquirer
        .prompt([
            new question('list','managerChoice', 'Select Manager to view Employees By:', inputArray)
        ])
        .then((answer)=> {
            let selectedID = answer.managerChoice.split(' ')[1]
            renderSubTable("employee", "manager_id", selectedID)
            setTimeout(resume, 200)
        })}
    }
    if(answers.Action == "View Total Cost of a Department"){
        console.log("coming soon!")
        resume()
    }
   /*if(answers.Action == "Add an Employee"){
        generateList('roles', 'title', constructEmployee)
       
        function constructEmployee(inputArray){
        inquirer
        .prompt([
            new question('input', 'firstName', 'What is the Employee\'s first name?'),
            new question('input', 'lastName', 'What is the Employee\'s last name?'),
            new question('list', 'role', 'What is the employee\'s role?', inputArray)
        ])
        
        .then((answer)=>
        console.log("coming soon!")
        resume()
    }
    }}*/
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

function talk(blah){
    console.log(blah)
}
/*
employeesFromIDs([1,2],[],talk)
transmuteEmployee(5, talk)
transmuteEmployee("Grazob Hrolkug", talk)*/
//renderTable('\`employee\` INNER JOIN \`roles\`')
function stolenQuery(){
    query = 'SELECT * FROM employee LEFT JOIN roles ON employee.role_id = roles.role_id FROM employee LEFT JOIN department ON employee.department_id = deparment.department_id'
    db.query(query, (err, res) => {
        if (err){
            throw err
        } 
            console.table(res)
        })
    }
stolenQuery()
//generateList('roles', 'title', talk)