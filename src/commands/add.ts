import { Command } from "commander";
import chalk from "chalk";
import { writeFile, readFile } from 'fs/promises';
import { TODOS_PATH } from '../constants'
import { readTodos, sleep, validatePriority } from "../utils";
import enquirer from 'enquirer';
import type { Todo } from '../types'
import { nanoid } from 'nanoid';
import { TodoPriority } from "../enums";
import { handleError } from '../lib';

type AddOptions = {
    title?: string;
    completed?: boolean;
    priority?: TodoPriority;
};

const addTodoCommand = new Command("add")
    .description('Adds a todo')
    .option('-t, --title <title>', 'Sets task title')
    .option('-c, --completed', 'Mark the item as completed')
    .option('-p, --priority <priority>', 'Sets task priority', validatePriority);

addTodoCommand
    .action(async (_, options) => {
        console.log(chalk.blueBright("Initializing the 'Add Todo' command...\n"));

        const commandOptions = options.opts() as AddOptions;

        let title = commandOptions.title;
        let priority = commandOptions.priority;
        let completed = commandOptions.completed;

        if (!title) {
            const response = await enquirer.prompt<{ title: string }>({
                type: "input",
                message: `What do you want to ${chalk.whiteBright("do?")}`,
                name: "title",
                validate: async (value) => {
                    await sleep();
                    return value.length > 5
                        ? true
                        : `${chalk.red("Error:")} Todo length must be more than 5 characters.`;
                },
            });

            title = response.title
        }

        if (!priority) {
            const response = await enquirer.prompt<{ priority: TodoPriority }>({
                type: "select",
                message: `What is the ${chalk.red("priority")} of this task?`,
                name: "priority",
                initial: 1,
                choices: [
                    { value: TodoPriority.Low, name: TodoPriority.Low },
                    { value: TodoPriority.Medium, name: TodoPriority.Medium },
                    { value: TodoPriority.High, name: TodoPriority.High },
                    { value: TodoPriority.Urgent, name: TodoPriority.Urgent },
                ],
            });

            priority = response.priority;
        }

        if (typeof completed === 'undefined') {
            const response = await enquirer.prompt<{ completed: boolean }>({
                type: "confirm",
                message: `Is this task ${chalk.green("completed")}?`,
                name: "completed",
            })

            completed = response.completed;
        }

        const newTodo = {
            id: nanoid(),
            title: title,
            completed: completed,
            priority: priority,
        } satisfies Todo;

        const todos = await readTodos({
            onFileNotFound: async () => {
                console.log(chalk.yellow("No todos file found. Creating a new one...\n"));
                const { error: writeTodosError } = await handleError(writeFile(TODOS_PATH, JSON.stringify([newTodo], null, 2)));
                if (writeTodosError) {
                    console.error(chalk.red("Error: Unable to create the todos file."));
                } else {
                    console.log(chalk.greenBright("Todo successfully added and new todos file created."));
                }
            },
            
        });
        if (!todos) return;
        
        todos.push(newTodo);

        const { error: writeTodosError } = await handleError(writeFile(TODOS_PATH, JSON.stringify(todos, null, 2)));
        if (writeTodosError) {
            console.error(chalk.red("Error: Unable to save the updated todos."));
        } else {
            console.log(chalk.greenBright("\nTodo successfully added!"));
            console.log(`${chalk.blue("Title:")} ${newTodo.title}`);
            console.log(`${chalk.blue("Priority:")} ${newTodo.priority}`);
            console.log(`${chalk.blue("Completed:")} ${newTodo.completed ? chalk.green("Yes") : chalk.red("No")}\n`);
        }
    });

export { addTodoCommand };
