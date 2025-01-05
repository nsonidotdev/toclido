import { Command } from "commander";
import { formatTodo, readTodos, validatePriority, validateStatus } from "../utils";
import { TodoPriority, TodoStatus } from "../enums";
import chalk from "chalk";
import blessed from 'blessed';

type ViewOptions = {
    status?: TodoStatus;
    priority?: TodoPriority;
}

const viewTodosCommand = new Command('view')
    .description('Adds a todo')
    .option('-s, --status <status>', 'Shows tasks with specified status', validateStatus)
    .option('-p, --priority <priority>', 'Shows tasks with specified priority', validatePriority);


viewTodosCommand.action(async (_, options) => {
    const commandOptions = options.opts() as ViewOptions;
    
    const todos = await readTodos({
        onFileNotFound: async () => {
            console.log(chalk.yellow("You don't have any tasks \n"));
        }, 
    });
    if (!todos) return;

    const filteredTodos = todos.filter((todo) => {
        if (commandOptions.priority && commandOptions.priority !== todo.priority) {
            return false;
        }

        if (commandOptions.status && commandOptions.status !== todo.status) {
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