import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

async function main() {
    await connectToDb();
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit',
        ]
    });
    console.log(action);

    if ((action) === 'View all departments') {
        const departments = await pool.query('SELECT * FROM department');
        console.table(departments);
    } else if ((action) === 'View all roles') {
        const roles = await pool.query('SELECT * FROM role');
        console.table(roles);
    } else if ((action) === 'View all employees') {
        const employees = await pool.query('SELECT * FROM employee');
        console.table(employees);
    } else if ((action) === 'Add a department') {
        const { name } = await inquirer.prompt({
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?'
        });
        await pool.query(`INSERT INTO department (name) VALUES (?)`, [name]);
        console.log(`${name} was added to departments!`);
    } else if ((action) === 'Add a role') {
        
}
}

main();