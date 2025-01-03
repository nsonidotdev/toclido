import { Command } from "commander";
import { stylePriority, validatePriority } from "../utils";
import { TodoPriority } from "../enums";
import { handleError } from "../lib";
import { readFile } from "fs/promises";
import { TODOS_PATH } from '../constants'
import chalk from "chalk";
import { Todo } from "../types";
import blessed from 'blessed';

type ViewOptions = {
    completed?: boolean;
    incompleted?: boolean;
    priority?: TodoPriority;
}

const viewTodosCommand = new Command('view')
    .description('Adds a todo')
    .option('-c, --completed', 'Shows only completed tasks')
    .option('-i, --incompleted', 'Shows only incompleted tasks')
    .option('-p, --priority <priority>', 'Shows tasks with specified priority', validatePriority);


viewTodosCommand.action(async (_, options) => {
    const commandOptions = options.opts() as ViewOptions;

    if (typeof commandOptions.completed === "boolean" && typeof commandOptions.incompleted === "boolean") {
        console.error(chalk.red("You can view either completed or incompleted tasks, if you want to view both don't path -i and -c options"))
        return;
    }

    const { data: todosJSON, error: readTodosError } = await handleError(readFile(TODOS_PATH, "utf-8"));
    if (readTodosError) {
        if (readTodosError.code === "ENOENT") {
            console.log(chalk.yellow("You don't have any tasks \n"));
        } else {
            console.error(chalk.red(`Error reading todos file: ${readTodosError.message}`));
        }

        return;
    }
    if (!todosJSON) return;

    const { data: todos, error: todosParseError } = await handleError<Todo[]>(() => JSON.parse(todosJSON));
    if (todosParseError || !(todos instanceof Array)) {
        console.error(chalk.red(`Error parsing todos file. It might be corrupted. Check the validity of the ${chalk.blue("todos.json")} file to a JSON format.`));
        return;
    }

    const filteredTodos = todos.filter((todo) => {
        if ('priority' in commandOptions && commandOptions.priority !== todo.priority) {
            return false;
        }

        if (typeof commandOptions.completed === "boolean" && commandOptions.completed && !todo.completed) {
            return false;
        }

        if (typeof commandOptions.incompleted === "boolean" && commandOptions.incompleted && todo.completed) {
            return false;
        }

        return true
    })

    if (filteredTodos.length === 0) {
        console.log(chalk.yellow("No tasks match your filter criteria."));
        return;
    }

    const screen = blessed.screen({
        smartCSR: true,
        title: "TODO List"
    });

    const todosBox = blessed.box({
        parent: screen,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        keys: true,
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
            ch: ' ',
            style: { bg: 'red' },
        },
        style: {
            fg: 'white',
            bg: 'black',
        },
        content: filteredTodos.map((todo, index) => {
            const status = todo.completed ? chalk.green("✔ Done") : chalk.red("✘ Pending");
            return `${chalk.bold(`${index + 1}. ${todo.title}`)}\nStatus: ${status} Priority: ${stylePriority(todo.priority)}\n\n---------------------------------------------------------`;
        }).join('\n\n'),
    });

    blessed.box({
        parent: screen,
        bottom: 0,
        height: 1,
        width: '100%',
        style: {
            fg: 'white',
            bg: 'grey',
        },
        content: "Arrow Up/Down to scroll, q to quit",
    });

    todosBox.key(['q', 'C-c'], () => process.exit(0));

    screen.render();
})

export { viewTodosCommand }