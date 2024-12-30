#!/usr/bin/env node

import { sleep, validatePriority } from "./utils";
import { TodoPriority } from "./enums"
import inquirer from 'inquirer';
import chalk from "chalk";
import { Command } from 'commander'; 

const program = new Command();

program
  .name('toclido')
  .description('CLI to help you manage your own business')
  .version('0.0.1');



// Add command
type AddOptions = {
    title?: string;
    completed?: boolean;
    priority?: TodoPriority;
}
program
  .command('add')
  .description('Adds a todo')
  .option('-t, --title <title>', 'Sets tasks priority') 
  .option('-c, --completed', 'Mark the item as completed') 
  .option('-p, --priority <priority>', 'Sets tasks priority', validatePriority) 
  .action(async (_, options) => {
    const commandOptions = options.opts() as AddOptions;

    const answers = await inquirer.prompt([
      {
        message: `What do you wanna ${chalk.whiteBright("do?")}`,
        type: "input",
        name: "title",
        default: commandOptions.title,
        validate: async (value) => {
            await sleep();

            return value.length > 5 
                ? true
                : "Todo length should include more then 5 characters";
        }
      },
      {
        message: `What is a ${chalk.red("priority")} of your this task`,
        name: "priority",
        type: "list",
        default: commandOptions.priority ?? TodoPriority.Medium,
        choices: [
            { value: TodoPriority.Low, name: TodoPriority.Low, },
            { value: TodoPriority.Medium, name: TodoPriority.Medium, },
            { value: TodoPriority.High, name: TodoPriority.High, },
            { value: TodoPriority.Urgent, name: TodoPriority.Urgent, },
        ]
      },
      {
        message: `Is this task ${chalk.green("completed")}?`,
        name: "completed",
        default: !!commandOptions.completed,
        type: "confirm",
        }
    ]);


    const completedStatus = answers.completed ? "completed" : "not completed";
    console.log(`New task "${chalk.green(answers.title)}" created, status: ${completedStatus}, priority: ${answers.priority}`);
});

program.parse(process.argv);
