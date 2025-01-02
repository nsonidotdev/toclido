export type Result<T, E = any> = {
    data: T;
    error: null;
} | {
    data: null,
    error: E
}

type DataSource<T> = Promise<T> | (() => Promise<T>)


export async function handleError<T, E = any>(dataSource: DataSource<T>): Promise<Result<T, E>> {
    try {
        let data: T | null = null;

        if (typeof dataSource === 'function') {
            data = await dataSource();
        } else {
            data = await dataSource;
        }

        return {
            data,
            error: null
        } 
    } catch (error) {
        return {
            data: null,
            error
        }
    }
}
