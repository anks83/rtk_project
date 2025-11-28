import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";

const POST_URL = "https://jsonplaceholder.typicode.com/posts";

/* const initialState = [
  {
    id: 1,
    title: "First Post",
    content: "Hello!",
    date: sub(new Date(), { minutes: 10 }).toISOString(),
    userId: 1,
    reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 },
  },
  {
    id: 2,
    title: "Second Post",
    content: "More text",
    date: sub(new Date(), { minutes: 5 }).toISOString(),
    userId: 2,
    reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 },
  },
];
 */

const initialState = {
  posts: [],
  status: "idle",
  error: null,
};

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  try {
    const response = await axios.get(POST_URL);
    return [...response.data];
  } catch (err) {
    return err.message;
  }
});

export const addNewPost = createAsyncThunk("posts/addNewPost", async (initialPost) => {
  try {
    const response = await axios.post(POST_URL, initialPost);
    return response.data;
  } catch (err) {
    return err.message;
  }
}); 

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    postAdded: (state, action) => {
      state.posts.push(action.payload);
    },
    prepare: (title, content, userId, date, reactions) => {
      return {
        payload: {
          id: nanoid(),
          title,
          content,
          date,
          userId,
          reactions,
        },
      };
    },
    reactionAdded: (state, action) => {
      const { postId, reaction } = action.payload;
      const existingPost = state.posts.find((post) => post.id === postId);
      if (existingPost) {
        existingPost.reactions[reaction]++;
      }
    },
  },
  extraReducers(builder){
    builder.addCase(fetchPosts.pending, (state, action) => {
        state.status = "loading";
    }) ;
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";

        let min = 1;
        const loadedPosts = action.payload.map((post) => {
          post.date = sub(new Date(), { minutes: min++ }).toISOString();
          post.reactions = { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 };
          return post;
        });
        state.posts = state.posts.concat(loadedPosts);
    });
    builder.addCase(fetchPosts.rejected, (state, action) => {   
        state.status = "failed";
        state.error = action.error.message;
    });
    builder.addCase(addNewPost.fulfilled, (state, action) => {  
        action.payload.userId = +action.payload.userId;
        action.payload.date = new Date().toISOString();
        action.payload.reactions = { thumbsUp: 0, wow: 0, heart: 0, rocket: 0, eyes: 0 };
        state.posts.push(action.payload);
    })
  }
});

export const selectAllPosts = (state) => state.posts.posts;
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;

export const { postAdded, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;
