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

    try {
        if (action === 'View all departments') {
            const result = await pool.query('SELECT * FROM department');
            console.table(result.rows);
            main(); // Go back to the main menu
        } else if (action === 'View all roles') {
            const result = await pool.query('SELECT * FROM role');
            console.table(result.rows);
            main(); // Go back to the main menu
        } else if (action === 'View all employees') {
            const result = await pool.query(`
                SELECT e.id, e.first_name, e.last_name, r.title AS job_title, 
                d.name AS department, r.salary, m.first_name AS manager_first, m.last_name AS manager_last
                FROM employee e
                LEFT JOIN role r ON e.role_id = r.id
                LEFT JOIN department d ON r.department_id = d.id
                LEFT JOIN employee m ON e.manager_id = m.id
            `);
            console.table(result.rows);
            main(); // Go back to the main menu
        } else if (action === 'Add a department') {
            const { name } = await inquirer.prompt({
                type: 'input',
                name: 'name',
                message: 'What is the name of the department?'
            });
            await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
            console.log(`${name} was added to departments!`);
            main(); // Go back to the main menu
        } else if (action === 'Add a role') {
            const departmentsResult = await pool.query('SELECT * FROM department');
            const departmentChoices = departmentsResult.rows.map(department => ({
                name: department.name,
                value: department.id
            }));

            const { title, salary, departmentId } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'What is the title of the role?'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary of the role?',
                    validate: (input) => !isNaN(input) || 'Please enter a valid number for salary.'
                },
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'What department does the role belong to?',
                    choices: departmentChoices
                }
            ]);

            await pool.query(
                'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
                [title, salary, departmentId]
            );
            console.log(`${title} was added to roles!`);
            main(); // Go back to the main menu
        } else if (action === 'Add an employee') {
            const rolesResult = await pool.query('SELECT * FROM role');
            const roleChoices = rolesResult.rows.map(role => ({
                name: role.title,
                value: role.id
            }));

            const employeesResult = await pool.query('SELECT * FROM employee');
            const managerChoices = employeesResult.rows.length > 0
                ? employeesResult.rows.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }))
                : [{ name: 'None', value: null }]; // If no managers exist, allow null

            // Add "None" as an option for managers
            managerChoices.push({ name: 'None', value: null });

            const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'What is the first name of the employee?'
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'What is the last name of the employee?'
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'What is the role of the employee?',
                    choices: roleChoices
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: 'Who is the manager of the employee?',
                    choices: managerChoices
                }
            ]);

            // If no manager is selected, set manager_id as null
            const manager = manager_id === 'None' ? null : manager_id;

            await pool.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                [first_name, last_name, role_id, manager]
            );
            console.log(`${first_name} ${last_name} was added to employees!`);
            main(); // Go back to the main menu
        } else if (action === 'Update an employee role') {
            const employeesResult = await pool.query('SELECT * FROM employee');
            const employeeChoices = employeesResult.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }));

            const rolesResult = await pool.query('SELECT * FROM role');
            const roleChoices = rolesResult.rows.map(role => ({
                name: role.title,
                value: role.id
            }));

            const { employeeId, roleId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Which employee would you like to update?',
                    choices: employeeChoices
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'What is the new role of the employee?',
                    choices: roleChoices
                }
            ]);

            await pool.query(
                'UPDATE employee SET role_id = $1 WHERE id = $2',
                [roleId, employeeId]
            );
            console.log('Employee role was updated!');
            main(); // Go back to the main menu
        } else {
            process.exit();
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

main();
