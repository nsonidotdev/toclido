#!/usr/bin/env node

import { writeFile, access, readFile } from 'fs/promises';
import { write } from 'fs';
import path from 'path';
import { sleep, validatePriority } from "./utils";
import { TodoPriority } from "./enums"
import inquirer from 'inquirer';
import chalk from "chalk";
import { Command } from 'commander';
import type { Todo } from './types'
import { nanoid } from 'nanoid';

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

    const todosPath = path.join(process.cwd(), "./todos.json");
    const newTodo = {
      id: nanoid(),
      title: answers.title,
      completed: answers.completed,
      priority: answers.priority,
    } satisfies Todo;

    try {
      const todosJSON = await readFile(todosPath, 'utf-8');
      const todos = JSON.parse(todosJSON);
    
      if (!(todos instanceof Array)) {
        throw new Error(`Can\'t parse your tasks. Try deleting all your tasks with \`${chalk.bgBlack.blue('toclido clear')}\` command`)
      }

      todos.push(newTodo);
      await writeFile(todosPath, JSON.stringify(todos))
    } catch (error) {
      if (error?.code === "ENOENT") {
        await writeFile(todosPath, JSON.stringify([newTodo]))
      } else {
        console.log(`Something went wrong: ${chalk.redBright(error.message)}`)
      }

    }
  });

program.parse(process.argv);
