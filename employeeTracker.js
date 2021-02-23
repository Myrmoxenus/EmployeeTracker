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

//For counting the number of members of a table that have a certain parameter at a certain value
function count(tableName, desiredField, desiredValue){
    let currentCount = 0
    for(a=0;a<tableName.length;a++){
        if(eval('tableName[a].' + desiredField) == desiredValue){
            currentCount++
        }
    }
    return currentCount
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

//Retrieves every designated paramater from designated table
function retrieveAll(tableName, field){
    let outputArray = []
    for(q=0; q<tableName.length;q++){
        eval('outputArray.push(tableName[q].' + field + ')')
    }
    return outputArray
}

//Transmute
function transmuteEmployee(employeeInput, employeeTable){
if (typeof employeeInput == 'number'){
    for (w=0; w<employeeTable.length;w++){
        if (employeeTable[w].id == employeeInput){
            return (employeeTable[w].first_name + ' ' + employeeTable[w].last_name)
        }
    }
}
else{
    let employeeName = employeeInput.split(' ')
    for(v=0; v<employeeTable.length;v++){
        if(employeeTable[v].first_name == employeeName[0] && employeeTable[v].last_name == employeeName[1]){
            return employeeTable[v].id
        }
    }
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

function start(){
    let employeeTable = downloadTable('employee')
    let rolesTable = downloadTable('roles')
    let departmentTable = downloadTable('department')
    //employeeTable[0].first_name
inquirer
.prompt([
new question ('list','Action', 'What would you like to do?', 
//an Array of all menu items for user actions
["View Employees", "View Roles", "View Departments", "View Employees by Manager", "View Total Cost of a Department", "Add an Employee","Add a Role", "Add a Department", "Update an Employee Manager", "Delete an Employee", "Delete a Role", "Delete a Department",])
])
.then(answers => {
    if(answers.Action == "View Employees"){
        console.table(employeeTable)//[0].first_name)
        resume()
    }
    if(answers.Action == "View Roles"){
        console.table(rolesTable)
        resume()
    }
    if(answers.Action == "View Departments"){
        console.table(departmentTable)
        resume()
    }
    if(answers.Action == "View Employees by Manager"){
        //Generates an array of all unique Manager IDs
        let uniqueManagerIDs = [...new Set(retrieveAll(employeeTable, 'manager_id'))]
        //Generates an array of employee names from the set of Manager IDs
        let uniqueManagers = []
        uniqueManagerIDs.forEach((val) => uniqueManagers.push(transmuteEmployee(val, employeeTable)))
        inquirer
        .prompt([
        new question ('list','managerChoice','Which manager?',uniqueManagers)
        ])
        .then(answers => {
            renderSubTable('employee', 'manager_id', transmuteEmployee(answers.managerChoice, employeeTable))
            //Calls resume on a small delay to prevent table formatting problems
            setTimeout(resume, 200)
        })
    }
    if(answers.Action == "View Total Cost of a Department"){
        //Constructs an array of all deparyment IDs
        let allDepartmentIDs = retrieveAll(departmentTable, 'id')
        //Constructs an array of all departments
        let allDepartments = retrieveAll(departmentTable, 'name')
        inquirer
        .prompt([
            new question ('list','departmentChoice', 'Which department?', allDepartments)
        ])
        .then(answers => {
            //... Alright, I know this is a huge mess but bare with me. Maybe I'll go back and make this less stupid later ¯\_(ツ)_/¯
            //Stores the selected department's ID
            let departmentChoiceID = allDepartmentIDs[allDepartments.indexOf(answers.departmentChoice)]
            //Function that generates an array of paired values. For every role assosciated with a department it makes a pair with the roleID as the first member, and the salary for that role as the second member
            function generateRolesFromDeptartmentID(departmentIDinput, tableName){
                let outputArray = []
                for(b=0;b<tableName.length;b++){
                    if(tableName[b].department_id == departmentIDinput){
                        let pair = []
                        pair.push(tableName[b].id)
                        pair.push(tableName[b].salary)
                        outputArray.push(pair)
                    }
                }
            return outputArray
            }
            //Creates the [roleId, salary] pair array using the user selected department
            let deparmentRolesAndSalariesArray = generateRolesFromDeptartmentID(departmentChoiceID, rolesTable)
            //Function that takes the [roleID, salary] pair array and constructs a [count, salary] array from it
            function countAndEvaluate(inputArray, tableName){
                let outputArray = []
                for(g=0; g<inputArray.length;g++){
                    let pair = []
                    pair.push(count(tableName, 'role_id', inputArray[g][0]))
                    pair.push(inputArray[g][1])
                    outputArray.push(pair)
                }
                return outputArray
            }
            //Creates the [employee count, salary] pair array
            let countAndSalariesArray = countAndEvaluate(deparmentRolesAndSalariesArray, employeeTable)
            //Multiplies the two values of each member of the array and adds them to the total
            function evaluateArray(inputArray){
               let total = 0
               for(t=0;t<inputArray.length;t++){
                   total += (inputArray[t][0]*inputArray[t][1])
               }
               return total
            }
            //Console.log()s the result. I am not proud of this solution.
            console.log(evaluateArray(countAndSalariesArray))
            resume()

        })
    }
    if(answers.Action == "Add an Employee"){
        //Constructs an array of all role IDs
        let allRoleIDs = retrieveAll(rolesTable, 'id')
        //Constructs an array of all roles by title
        let allRoles = retrieveAll(rolesTable, 'title')
        //Constructs an array of all employee IDs
        let allEmployeeIDs = retrieveAll(employeeTable, 'id')
        //Constructs an array of all employee by name
        let allEmployees = []
        allEmployeeIDs.forEach((val) => allEmployees.push(transmuteEmployee(val, employeeTable)))
        inquirer
        .prompt([
            new question ('input','firstName','What is the employee\'s first name?'),
            new question ('input','lastName','What is the employee\'s last name?'),
            new question ('list','role','What is the employee\'s role?', allRoles),
            new question ('list','manager','Who is the employee\'s manager?', allEmployees)
        ])
        .then(answers => {
            //Adds answer information to employee table, manager ID and role ID are found by equivalent index in the generated arrays
            addToTable('employee', answers.firstName, answers.lastName, allRoleIDs[allRoles.indexOf(answers.role)], allEmployeeIDs[allEmployees.indexOf(answers.manager)])
            console.log('Employee Added!')
            resume()
        })
    }
    if(answers.Action == "Add a Role"){
        //Constructs an array of all deparyment IDs
        let allDepartmentIDs = retrieveAll(departmentTable, 'id')
        //Constructs an array of all departments
        let allDepartments = retrieveAll(departmentTable, 'name')
        inquirer
        .prompt
    ([
        new question ('input', 'title', 'What is the new role called?'),
        new question ('input', 'salary', 'What is the salary for this position?'),
        new question ('list','department','To which department belongs the role?', allDepartments),
    ])
    .then(answers => {
        if(isNaN(answers.salary)){
            console.log('Please enter a number for salary!')
            resume()}
        else{
        //Adds user information to role table. Department ID is found by equivalent index in the generated arrays
        addToTable('roles', answers.title, answers.salary, allDepartmentIDs[allDepartments.indexOf(answers.department)])
        console.log('Role added!')
        resume()}
    })
    }
    if(answers.Action == "Add a Department"){
        inquirer
        .prompt
        ([
        new question ('input', 'deptName', 'What is the name of the new department?')
        ])
        .then(answers =>{
        addToTable('department', answers.deptName)
        console.log('Department added!')
        resume()
    })
    }
    if(answers.Action == "Update an Employee Manager"){
        //Constructs an array of all employee IDs
        let allEmployeeIDs = retrieveAll(employeeTable, 'id')
        //Constructs an array of all employee by name
        let allEmployees = []
        allEmployeeIDs.forEach((val) => allEmployees.push(transmuteEmployee(val, employeeTable)))
        inquirer
        .prompt
        ([
        new question ('list', 'employeeChoice', 'Which employee?', allEmployees),
        new question ('list', 'managerChoice', 'Who will be the new manager?', allEmployees)
        ])
        .then(answers =>{
        updateTableByID('employee', allEmployeeIDs[allEmployees.indexOf(answers.employeeChoice)], 'manager_id', allEmployeeIDs[allEmployees.indexOf(answers.managerChoice)])
        console.log('Employee Manager Updated!')
        resume()
    })
    }
    if(answers.Action == "Delete an Employee"){
        //Constructs an array of all employee IDs
        let allEmployeeIDs = retrieveAll(employeeTable, 'id')
        //Constructs an array of all employee by name
        let allEmployees = []
        allEmployeeIDs.forEach((val) => allEmployees.push(transmuteEmployee(val, employeeTable)))
        inquirer
        .prompt
        ([
            new question ('list', 'employeeChoice', 'Which employee?', allEmployees)
        ])
        .then(answers =>{
            deleteFromTableByID('employee', allEmployeeIDs[allEmployees.indexOf(answers.employeeChoice)])
            console.log('Employee Deleted!')
            resume()
        })
    }
    if(answers.Action == "Delete a Role"){
        //Constructs an array of all role IDs
        let allRoleIDs = retrieveAll(rolesTable, 'id')
        //Constructs an array of all roles by title
        let allRoles = retrieveAll(rolesTable, 'title')
        inquirer
        .prompt
        ([
            new question ('list', 'roleChoice', 'Which role?', allRoles)
        ])
        .then(answers =>{
            deleteFromTableByID('roles', allRoleIDs[allRoles.indexOf(answers.roleChoice)])
            console.log('Role Deleted!')
            resume()
        })
    }
    if(answers.Action == "Delete a Department"){
        //Constructs an array of all deparyment IDs
        let allDepartmentIDs = retrieveAll(departmentTable, 'id')
        //Constructs an array of all departments
        let allDepartments = retrieveAll(departmentTable, 'name')
        inquirer
        .prompt
        ([
            new question ('list', 'departmentChoice', 'Which department?', allDepartments)
        ])
        .then(answers =>{
            deleteFromTableByID('department', allDepartmentIDs[allDepartments.indexOf(answers.departmentChoice)])
            console.log('Department Deleted!')
            resume()
        })
    }
    })}

//Runs start() on startup
start()