import { query, queryList, slug } from "../lib/lib.js";

const GITHUB_GRAPHQL_URL = Deno.env.get("GITHUB_GRAPHQL_URL");
const GITHUB_REPOSITORY_OWNER = Deno.env.get("GITHUB_REPOSITORY_OWNER");
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

const AUTHORIZATION = `Bearer ${GITHUB_TOKEN}`;
const BATCH_SIZE = 100;
const REPOSITORY_NAME = "nicholaschiasson.github.io";
const DISCUSSION_CATEGORY_SLUG = "blog-posts";

const DISCUSSION_ID = Deno.args[0];

(async function main() {
  try {
    const discussionCategory = DISCUSSION_ID
      ? undefined
      : (
          await query(
            GITHUB_GRAPHQL_URL,
            AUTHORIZATION,
            `query GetRepositoryDiscussionCategory {
            repository(
              owner: "${GITHUB_REPOSITORY_OWNER}",
              name: "${REPOSITORY_NAME}"
            ) {
              id
              discussionCategories(
                first: 100
              ) {
                nodes {
                  id
                  name
                }
              }
              discussionCategory(
                slug: "${DISCUSSION_CATEGORY_SLUG}"
              ) {
                id
              }
            }
          }`,
          )
        ).data.repository.discussionCategory;

    const discussionNode = `{
      id
      author {
        avatarUrl(
          size: 64
        )
        login
        url
      }
      authorAssociation
      bodyHTML
      lastEditedAt
      number
      publishedAt
      title
      upvoteCount
      url
    }`;

    const discussions = DISCUSSION_ID
      ? [
          (
            await query(
              GITHUB_GRAPHQL_URL,
              AUTHORIZATION,
              `query GetDiscussion {
                node(
                  id: "${DISCUSSION_ID}"
                ) {
                  ... on Discussion ${discussionNode}
                }
              }`,
            )
          ).data.node,
        ]
      : await queryList(
          GITHUB_GRAPHQL_URL,
          AUTHORIZATION,
          (cursor) => `query GetRepositoryDiscussions {
          repository(
            owner: "${GITHUB_REPOSITORY_OWNER}",
            name: "${REPOSITORY_NAME}"
          ) {
            discussions(
              after: ${cursor},
              categoryId: "${discussionCategory.id}",
              first: ${BATCH_SIZE},
              orderBy: { field: CREATED_AT, direction: DESC }
            ) {
              totalCount
              pageInfo {
                hasNextPage
              }
              edges {
                cursor
                node ${discussionNode}
              }
            }
          }
        }`,
          (res) => res.data.repository.discussions,
        );

    for (let discussion of discussions) {
      discussion.slug = slug(discussion.title);
      discussion.comments = (
        await queryList(
          GITHUB_GRAPHQL_URL,
          AUTHORIZATION,
          (cursor) => `query GetRepositoryDiscussionComments {
            node(
              id: "${discussion.id}",
            ) {
              ... on Discussion {
                comments(
                  after: ${cursor},
                  first: ${BATCH_SIZE}
                ) {
                  totalCount
                  pageInfo {
                    hasNextPage
                  }
                  edges {
                    cursor
                    node {
                      id
                      author {
                        avatarUrl(
                          size: 64
                        )
                        login
                        url
                      }
                      authorAssociation
                      bodyText
                      lastEditedAt
                      publishedAt
                      upvoteCount
                      url
                    }
                  }
                }
              }
            }
          }`,
          (res) => res.data.node.comments,
        )
      ).reverse();

      for (let comment of discussion.comments) {
        comment.replies = (
          await queryList(
            GITHUB_GRAPHQL_URL,
            AUTHORIZATION,
            (cursor) => `query GetCommentReplies {
                node(
                  id: "${comment.id}"
                ) {
                  ... on DiscussionComment {
                    replies(
                      after: ${cursor},
                      first: ${BATCH_SIZE}
                    ) {
                      totalCount
                      pageInfo {
                        hasNextPage
                      }
                      edges {
                        cursor
                        node {
                          id
                          author {
                            avatarUrl(
                              size: 64
                            )
                            login
                            url
                          }
                          authorAssociation
                          bodyText
                          lastEditedAt
                          publishedAt
                          upvoteCount
                          url
                        }
                      }
                    }
                  }
                }
              }`,
            (res) => res.data.node.replies,
          )
        ).reverse();
      }
      discussion.totalReplies = discussion.comments.reduce((sum, { replies }) => sum + replies.length, 0);
    }
    console.info(JSON.stringify(DISCUSSION_ID ? discussions[0] : discussions, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
