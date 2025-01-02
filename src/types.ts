import { TodoPriority } from "./enums";

export type Todo = {
    id: string;
    title: string;
    priority: TodoPriority;
    completed: boolean;
}