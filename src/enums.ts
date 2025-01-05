export const TodoPriority = {
    Low: "low",
    Medium: "medium",
    High: "high",
    Urgent: "urgent"
} as const;
export type TodoPriority = typeof TodoPriority[keyof typeof TodoPriority]

export const TodoStatus = {
    Todo: "todo",
    InProgress: "in-progress",
    Done: "done",
} as const;
export type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus]