import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddPostForm from './AddPostForm';
import postsReducer from './postsSlice';
import usersReducer from '../users/usersSlice';
import '@testing-library/jest-dom';

// Mock the addNewPost thunk
jest.mock('./postsSlice', () => ({
    ...jest.requireActual('./postsSlice'),
    addNewPost: jest.fn(),
}));

const { addNewPost } = require('./postsSlice');

describe('AddPostForm', () => {
    let store;
    const mockUsers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Bob Johnson' },
    ];

    beforeEach(() => {
        // Create a fresh store for each test
        store = configureStore({
            reducer: {
                posts: postsReducer,
                users: usersReducer,
            },
            preloadedState: {
                users: mockUsers,
                posts: {
                    posts: [],
                    status: 'idle',
                    error: null,
                },
            },
        });

        // Reset mocks
        jest.clearAllMocks();
        
        // Mock the unwrap function
        addNewPost.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({}),
        });
    });

    const renderWithProvider = (component) => {
        return render(<Provider store={store}>{component}</Provider>);
    };

    test('renders the form with all required fields', () => {
        renderWithProvider(<AddPostForm />);

        expect(screen.getByText('Add a New Post')).toBeInTheDocument();
        expect(screen.getByLabelText('Post Title:')).toBeInTheDocument();
        expect(screen.getByLabelText('Author:')).toBeInTheDocument();
        expect(screen.getByLabelText('Content:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Post' })).toBeInTheDocument();
    });

    test('renders author select with all users', () => {
        renderWithProvider(<AddPostForm />);

        const select = screen.getByLabelText('Author:');
        const options = select.querySelectorAll('option');

        // +1 for the empty option
        expect(options).toHaveLength(mockUsers.length + 1);
        expect(options[0].value).toBe('');
        expect(options[1].textContent).toBe('John Doe');
        expect(options[2].textContent).toBe('Jane Smith');
        expect(options[3].textContent).toBe('Bob Johnson');
    });

    test('save button is disabled when form is empty', () => {
        renderWithProvider(<AddPostForm />);

        const saveButton = screen.getByRole('button', { name: 'Save Post' });
        expect(saveButton).toBeDisabled();
    });

    test('save button is disabled when only title is filled', () => {
        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        fireEvent.change(titleInput, { target: { value: 'Test Title' } });

        const saveButton = screen.getByRole('button', { name: 'Save Post' });
        expect(saveButton).toBeDisabled();
    });

    test('save button is disabled when only content is filled', () => {
        renderWithProvider(<AddPostForm />);

        const contentInput = screen.getByLabelText('Content:');
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });

        const saveButton = screen.getByRole('button', { name: 'Save Post' });
        expect(saveButton).toBeDisabled();
    });

    test('save button is disabled when only userId is selected', () => {
        renderWithProvider(<AddPostForm />);

        const authorSelect = screen.getByLabelText('Author:');
        fireEvent.change(authorSelect, { target: { value: '1' } });

        const saveButton = screen.getByRole('button', { name: 'Save Post' });
        expect(saveButton).toBeDisabled();
    });

    test('save button is enabled when all fields are filled', () => {
        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        const contentInput = screen.getByLabelText('Content:');
        const authorSelect = screen.getByLabelText('Author:');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });
        fireEvent.change(authorSelect, { target: { value: '1' } });

        const saveButton = screen.getByRole('button', { name: 'Save Post' });
        expect(saveButton).not.toBeDisabled();
    });

    test('updates title input value when typing', () => {
        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        fireEvent.change(titleInput, { target: { value: 'My Test Title' } });

        expect(titleInput.value).toBe('My Test Title');
    });

    test('updates content input value when typing', () => {
        renderWithProvider(<AddPostForm />);

        const contentInput = screen.getByLabelText('Content:');
        fireEvent.change(contentInput, { target: { value: 'My Test Content' } });

        expect(contentInput.value).toBe('My Test Content');
    });

    test('updates author select value when selecting', () => {
        renderWithProvider(<AddPostForm />);

        const authorSelect = screen.getByLabelText('Author:');
        fireEvent.change(authorSelect, { target: { value: '2' } });

        expect(authorSelect.value).toBe('2');
    });

    test('dispatches addNewPost action when save button is clicked with valid data', async () => {
        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        const contentInput = screen.getByLabelText('Content:');
        const authorSelect = screen.getByLabelText('Author:');
        const saveButton = screen.getByRole('button', { name: 'Save Post' });

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });
        fireEvent.change(authorSelect, { target: { value: '1' } });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(addNewPost).toHaveBeenCalledWith({
                title: 'Test Title',
                body: 'Test Content',
                userId: 1,
            });
        });
    });

    test('clears form fields after successful submission', async () => {
        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        const contentInput = screen.getByLabelText('Content:');
        const authorSelect = screen.getByLabelText('Author:');
        const saveButton = screen.getByRole('button', { name: 'Save Post' });

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });
        fireEvent.change(authorSelect, { target: { value: '1' } });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(titleInput.value).toBe('');
            expect(contentInput.value).toBe('');
            expect(authorSelect.value).toBe('');
        });
    });

    test('handles error when post submission fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        addNewPost.mockReturnValue({
            unwrap: jest.fn().mockRejectedValue(new Error('Failed to save')),
        });

        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        const contentInput = screen.getByLabelText('Content:');
        const authorSelect = screen.getByLabelText('Author:');
        const saveButton = screen.getByRole('button', { name: 'Save Post' });

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });
        fireEvent.change(authorSelect, { target: { value: '1' } });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to save the post: ',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    test('disables save button while request is pending', async () => {
        let resolvePromise;
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        addNewPost.mockReturnValue({
            unwrap: jest.fn().mockReturnValue(pendingPromise),
        });

        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        const contentInput = screen.getByLabelText('Content:');
        const authorSelect = screen.getByLabelText('Author:');
        const saveButton = screen.getByRole('button', { name: 'Save Post' });

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });
        fireEvent.change(authorSelect, { target: { value: '1' } });

        fireEvent.click(saveButton);

        // Button should be disabled during request
        expect(saveButton).toBeDisabled();

        // Resolve the promise
        resolvePromise({});

        await waitFor(() => {
            expect(saveButton).not.toBeDisabled();
        });
    });

    test('prevents multiple submissions when button is clicked rapidly', async () => {
        renderWithProvider(<AddPostForm />);

        const titleInput = screen.getByLabelText('Post Title:');
        const contentInput = screen.getByLabelText('Content:');
        const authorSelect = screen.getByLabelText('Author:');
        const saveButton = screen.getByRole('button', { name: 'Save Post' });

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });
        fireEvent.change(authorSelect, { target: { value: '1' } });

        // Click multiple times rapidly
        fireEvent.click(saveButton);
        fireEvent.click(saveButton);
        fireEvent.click(saveButton);

        await waitFor(() => {
            // Should only be called once due to status check
            expect(addNewPost).toHaveBeenCalledTimes(1);
        });
    });

    test('renders with empty user list when no users are available', () => {
        const emptyStore = configureStore({
            reducer: {
                posts: postsReducer,
                users: usersReducer,
            },
            preloadedState: {
                users: [],
                posts: {
                    posts: [],
                    status: 'idle',
                    error: null,
                },
            },
        });

        render(
            <Provider store={emptyStore}>
                <AddPostForm />
            </Provider>
        );

        const select = screen.getByLabelText('Author:');
        const options = select.querySelectorAll('option');

        // Only empty option should be present
        expect(options).toHaveLength(1);
        expect(options[0].value).toBe('');
    });

    test('converts userId to number when selecting author', () => {
        renderWithProvider(<AddPostForm />);

        const authorSelect = screen.getByLabelText('Author:');
        const titleInput = screen.getByLabelText('Post Title:');
        const contentInput = screen.getByLabelText('Content:');
        const saveButton = screen.getByRole('button', { name: 'Save Post' });

        fireEvent.change(authorSelect, { target: { value: '2' } });
        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });

        fireEvent.click(saveButton);

        expect(addNewPost).toHaveBeenCalledWith({
            title: 'Test Title',
            body: 'Test Content',
            userId: 2, // Should be number, not string
        });
    });
});
