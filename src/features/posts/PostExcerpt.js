import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";

function POstExcerpt({ post }) {
  return (
    <article className="post">
      <h3>{post.title}</h3>
      <p>{post.body.substring(0, 100)}</p>
      <p className="post-credits">
        <PostAuthor userId={post.userId} />
        <TimeAgo timestamp={post.date} />
      </p>
      <ReactionButtons post={post} />
    </article>
  );
}

export default POstExcerpt;
