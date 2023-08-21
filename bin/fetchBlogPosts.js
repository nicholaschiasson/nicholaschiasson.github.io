import { query, queryList, slug } from "../lib/lib.js";

const GITHUB_REPOSITORY_OWNER = Deno.env.get("GITHUB_REPOSITORY_OWNER");

const BATCH_SIZE = 100;
const REPOSITORY_NAME = "nicholaschiasson.github.io";
const DISCUSSION_CATEGORY_SLUG = "blog-posts";

const DISCUSSION_ID = Deno.args[0];

(async function main() {
  try {
    const discussionCategory = DISCUSSION_ID
      ? undefined
      : (
          await query(`query GetRepositoryDiscussionCategory {
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
          }`)
        ).data.repository.discussionCategory;

    const discussions = DISCUSSION_ID
      ? [
          (
            await query(`query GetDiscussion {
              node(
                id: "${DISCUSSION_ID}"
              ) {
                ... on Discussion {
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
                  createdAt
                  lastEditedAt
                  number
                  publishedAt
                  title
                  updatedAt
                  upvoteCount
                  url
                }
              }
            }`)
          ).data.node,
        ]
      : await queryList(
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
                  bodyHTML
                  createdAt
                  lastEditedAt
                  number
                  publishedAt
                  title
                  updatedAt
                  upvoteCount
                  url
                }
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
                      createdAt
                      lastEditedAt
                      publishedAt
                      updatedAt
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
                          createdAt
                          lastEditedAt
                          publishedAt
                          updatedAt
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
    }
    console.info(JSON.stringify(DISCUSSION_ID ? discussions[0] : discussions));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
