import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

async function main() {
    await connectToDb();
    
}

main();