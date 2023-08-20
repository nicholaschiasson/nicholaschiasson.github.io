#!/usr/bin/env node

const BATCH_SIZE = 100;
const REPOSITORY_OWNER = "nicholaschiasson";
const REPOSITORY_NAME = "nicholaschiasson.github.io";
const DISCUSSION_CATEGORY_SLUG = "blog-posts";

async function query(query) {
  const res = await (
    await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })
  ).json();

  if (res.errors) {
    console.error(JSON.stringify(res.data, null, 2));
    throw res.errors.map((e) => new Error(e.message));
  }

  return res;
}

async function queryList(buildQuery, accessData) {
  let cursor = null;
  let hasNextPage = true;
  const list = [];

  while (hasNextPage) {
    const response = accessData(await query(buildQuery(cursor)));

    for (let { node } of response.edges) {
      list.push(node);
    }

    hasNextPage = response.pageInfo.hasNextPage;

    if (hasNextPage) {
      cursor = `"${response.edges.at(-1).cursor}"`;
    }
  }

  return list;
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^\w]|_/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

(async function main() {
  try {
    const { discussionCategory } = (
      await query(`query GetRepositoryDiscussionCategory {
        repository(
          owner: "${REPOSITORY_OWNER}",
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
    ).data.repository;

    const discussions = await queryList(
      (cursor) => `query GetRepositoryDiscussions {
          repository(
              owner: "${REPOSITORY_OWNER}",
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
            (cursor) => `query GetRepositoryDiscussionComments {
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
    console.info(JSON.stringify(discussions, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
