import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3500/' }),
    endpoints: builder => ({
        getTodos: builder.query({
            query: () => '/todos'
        }),
        addTodo: builder.mutation({
            query: (newTodo) => ({
                url: '/todos',
                method: 'POST',
                body: newTodo
            })
        }),
        updateTodo: builder.mutation({
            query: (updatedTodo) => ({
                url: `/todos/${updatedTodo.id}`,
                method: 'PATCH',
                body: updatedTodo
            })
        }),
        deleteTodo: builder.mutation({
            query: (id) => ({
                url: `/todos/${id}`,
                method: 'DELETE'
            })
        })
    })
});

export const {
    useGetTodosQuery,
    useAddTodoMutation,
    useUpdateTodoMutation,
    useDeleteTodoMutation
} = apiSlice;