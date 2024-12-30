export const TodoPriority = {
    Low: "low",
    Medium: "medium",
    High: "high",
    Urgent: "urgent"
} as const;
export type TodoPriority = typeof TodoPriority[keyof typeof TodoPriority]