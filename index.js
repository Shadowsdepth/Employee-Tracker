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

            const manager = manager_id === 'None' ? null : manager_id;

            await pool.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                [first_name, last_name, role_id, manager]
            );
            console.log(`${first_name} ${last_name} was added to employees!`);
            main(); // Go back to the main menu
        } else if (action === 'Update an employee role') {
            try {
                // Fetch all employees with their current details
                const employeesResult = await pool.query(`
                    SELECT e.id, e.first_name, e.last_name, r.title AS job_title, 
                        d.name AS department, r.salary, m.first_name AS manager_first, m.last_name AS manager_last
                    FROM employee e
                    LEFT JOIN role r ON e.role_id = r.id
                    LEFT JOIN department d ON r.department_id = d.id
                    LEFT JOIN employee m ON e.manager_id = m.id
                `);

                const employeeChoices = employeesResult.rows.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }));

                const rolesResult = await pool.query('SELECT id, title FROM role');
                const roleChoices = rolesResult.rows.map(role => ({
                    name: role.title,
                    value: role.id
                }));

                // Fetch all departments to allow the user to choose one
                const departmentsResult = await pool.query('SELECT id, name FROM department');
                const departmentChoices = departmentsResult.rows.map(department => ({
                    name: department.name,
                    value: department.id
                }));

                const employeesMap = employeesResult.rows.reduce((map, employee) => {
                    map[employee.id] = employee;
                    return map;
                }, {});

                const { employeeId } = await inquirer.prompt({
                    type: 'list',
                    name: 'employeeId',
                    message: 'Which employee would you like to update?',
                    choices: employeeChoices
                });

                const employee = employeesMap[employeeId];

                // Allow the user to update fields with current values as defaults
                const { first_name, last_name, roleId, salary, managerId, departmentId } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: 'What is the first name of the employee?',
                        default: employee.first_name
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: 'What is the last name of the employee?',
                        default: employee.last_name
                    },
                    {
                        type: 'list',
                        name: 'roleId',
                        message: 'What is the new role of the employee?',
                        choices: roleChoices,
                        default: employee.job_title // We default it to their current job title
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the new salary of the employee?',
                        default: employee.salary,
                        validate: (input) => !isNaN(input) || 'Please enter a valid number for salary.'
                    },
                    {
                        type: 'list',
                        name: 'departmentId',
                        message: 'Which department does the role belong to?',
                        choices: departmentChoices,
                        default: employee.department // Set default to current department
                    },
                    {
                        type: 'list',
                        name: 'managerId',
                        message: 'Who is the manager of the employee?',
                        choices: employeeChoices.concat([{ name: 'None', value: null }]), // Add 'None' option for no manager
                        default: employee.manager_first ? `${employee.manager_first} ${employee.manager_last}` : 'None'
                    }
                ]);

                // Update the employee's role and other fields in the database
                await pool.query(
                    `
                    UPDATE employee 
                    SET 
                        first_name = $1, 
                        last_name = $2, 
                        role_id = $3, 
                        manager_id = $4
                    WHERE id = $5
                    `,
                    [first_name, last_name, roleId, managerId === 'None' ? null : managerId, employeeId]
                );

                // Update salary and department if needed (this will be necessary if department has changed, as roles may have different departments)
                await pool.query(
                    `
                    UPDATE role
                    SET 
                        salary = $1,
                        department_id = $2
                    WHERE id = $3
                    `,
                    [salary, departmentId, roleId]
                );

                console.log('Employee details were updated!');
                main(); // Go back to the main menu
            } catch (error) {
                console.error('An error occurred while updating the employee details:', error.message);
            }
        } else {
            process.exit();
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

main();
