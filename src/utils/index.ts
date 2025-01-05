import chalk from 'chalk';
import { Todo } from '../types';
import enquirer from 'enquirer';



export const sleep = (ms: number = 1000) => new Promise(r => setTimeout(r, ms));

export const highlightOccurrences = (options: {
    content: string;
    targetText: string;
    colorFn?: (text: string) => string
}): string => {
    const highlightFn = options.colorFn ?? chalk.magentaBright.underline;

    let result = "";
    let currentIndex = 0;

    const splittedText = options.content.toLowerCase().split(options.targetText.toLowerCase())
    splittedText.forEach(({ length }) => {
        result += options.content.substring(currentIndex, currentIndex + length)
        result += highlightFn(options.content.substring(currentIndex + length, currentIndex + length + options.targetText.length))

        currentIndex = currentIndex + length + options.targetText.length;
    })

    return result;
}


type FindTodoOptions = {
    todos: Todo[];
    searchStr?: string;
}
export const findTodoByTitle = async ({ todos, searchStr }: FindTodoOptions): Promise<Todo | undefined> => {
    if (!todos.length) {
        console.log(chalk.yellow("No tasks match your filter criteria."));
        return;
    }

    if (!searchStr) {
        const { title } = await enquirer.prompt<{ title: string }>({
            type: "autocomplete",
            message: "Search task by title",
            name: "title",
            // @ts-expect-error
            limit: 10,
            choices: todos.map(todo => todo.title),
        });

        return todos.find(task => task.title === title);
    }

    if (searchStr.length < 3) {
        console.error(chalk.red("Title filter option should include more than 2 characters"))
        return;
    }

    const filteredTasksByTitle = todos.filter(task => {
        return task.title.toLowerCase().includes(searchStr.toLowerCase())
    });
    if (!filteredTasksByTitle.length) {
        console.log(chalk.yellow("No tasks match your filter criteria."));
        return;
    } else if (filteredTasksByTitle.length === 1) {
        return filteredTasksByTitle[0];
    }

    const { title } = await enquirer.prompt<{ title: string }>({
        type: "select",
        message: "Select a task you meant",
        name: "title",
        // @ts-expect-error
        limit: 10,
        choices: filteredTasksByTitle.map(task => ({
            message: highlightOccurrences({ content: task.title, targetText: searchStr }),
            value: task.title
        }))
    });

    return filteredTasksByTitle.find(task => task.title === title);
}

export * from './validate';
export * from './data';
export * from './format';