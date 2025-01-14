import { Command } from "commander";
import chalk from "chalk";
import { readTodos, formatTodo, sleep, validatePriority, writeTodos, formatTodoStatus, validateStatus } from "../utils";
import enquirer from 'enquirer';
import type { Todo } from '../types'
import { nanoid } from 'nanoid';
import { TodoPriority, TodoStatus } from "../enums";
import { promptPriority, promptStatus } from "../utils/prompts";

type AddOptions = {
    title?: string;
    status?: TodoStatus;
    priority?: TodoPriority;
};

const addTodoCommand = new Command("add")
    .description('Adds a todo')
    .option('-t, --title <title>', 'Sets task title')
    .option('-s, --status <status>', 'Sets status of a task', validateStatus)
    .option('-p, --priority <priority>', 'Sets task priority', validatePriority);

addTodoCommand
    .action(async (_, options) => {
        console.log(chalk.blueBright("Initializing the 'Add Todo' command...\n"));

        const commandOptions = options.opts() as AddOptions;

        let title = commandOptions.title;
        let priority = commandOptions.priority;
        let status = commandOptions.status;

        if (!title) {
            const response = await enquirer.prompt<{ title: string }>({
                type: "input",
                message: `What do you want to ${chalk.whiteBright("do?")}`,
                name: "title",
                initial: "Hello",
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
            priority = await promptPriority()
        }

        if (!status) {
            status  = await promptStatus();
        }

        const newTodo = {
            id: nanoid(),
            title,
            status,
            priority,
            createdAt: new Date()
        } satisfies Todo;

        const todos = await readTodos({
            onFileNotFound: async () => {
                console.log(chalk.yellow("No todos file found. Creating a new one...\n"));
                const { error: writeTodosError } = await writeTodos([newTodo]);
                if (writeTodosError) {
                    console.error(chalk.red("Error: Unable to create the todos file."));
                } else {
                    console.log(chalk.greenBright("Todo successfully added and new todos file created."));
                }
            },

        });
        if (!todos) return;

        todos.push(newTodo);

        const { error: writeTodosError } = await writeTodos(todos);
        if (writeTodosError) {
            console.error(chalk.red("Error: Unable to save the updated todos."));
        } else {
            console.log(chalk.greenBright("\nTodo successfully added!"));
            console.log(formatTodo(newTodo, { showCreatedAt: false }));
        }
    });

export { addTodoCommand };
