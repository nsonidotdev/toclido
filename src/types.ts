import { TodoPriority, TodoStatus } from "./enums";

export type Todo = {
    id: string;
    title: string;
    priority: TodoPriority;
    status: TodoStatus;
}