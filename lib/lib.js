export async function query(graphqlUrl, authorization, query) {
  const res = await (
    await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: authorization,
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

export async function queryList(graphqlUrl, authorization, buildQuery, accessData) {
  let cursor = null;
  let hasNextPage = true;
  const list = [];

  while (hasNextPage) {
    const response = accessData(await query(graphqlUrl, authorization, buildQuery(cursor)));

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

export function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^\w]|_/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}
