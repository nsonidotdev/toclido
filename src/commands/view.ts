import { Command } from "commander";
import { formatTodo, readTodos, validatePriority } from "../utils";
import { TodoPriority } from "../enums";
import chalk from "chalk";
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

    
    const todos = await readTodos({
        onFileNotFound: async () => {
            console.log(chalk.yellow("You don't have any tasks \n"));
        }, 
    });
    if (!todos) return;

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
            return `${formatTodo(todo, { prefix: index + 1 + '. '})}`;
        }).join('\n'),
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