export const fetchCustomerList = (name: string) => {
  const query = {
    query: '{\n  buckets(groupBy: {tasks: {}}, pagination: {limit: 50, after: \"\", preciseCount: true}) {\n    tasks(filterGroup: $filterGroup, orderBy: $orderBy, includeAncestors: {pathField: \"path\"}, orderByPath: \"path\", limit: 1000) {\n      key\n      name\n      uuid\n      serverUpdateStamp\n      path\n      subTaskCount\n      subTaskDoneCount\n      position\n      status {\n        uuid\n        name\n        category\n      }\n      deadline\n      subTasks {\n        uuid\n      }\n      issueType {\n        uuid\n      }\n      subIssueType {\n        uuid\n      }\n      project {\n        uuid\n      }\n      parent {\n        uuid\n      }\n      estimatedHours\n      remainingManhour\n      issueTypeScope {\n        uuid\n      }\n      relatedTasks {\n        status {\n          category\n        }\n      }\n      number\n      totalManhour\n      name\n      status {\n        uuid\n        name\n      }\n      _PUuiRRim {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _U1Zf7epq\n      _TioFkeZn {\n        key\n        uuid\n        name\n        avatar\n      }\n      assign {\n        key\n        uuid\n        name\n        avatar\n      }\n      _PAySkY4n\n      _WS42UWiW {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      deadline\n      _DMmewrUm\n      serverUpdateStamp\n      issueType {\n        key\n        uuid\n        name\n      }\n      subIssueType {\n        key\n        uuid\n        name\n      }\n      _BPo72n62\n      _N6UcMTLq {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _VK8uFpQv {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _NnAcdq9R\n      priority {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _ScMa6vje\n      _HLWpxZVo\n      estimateVariance\n      _EbY6vaJR\n    }\n    key\n    pageInfo {\n      count\n      preciseCount\n      totalCount\n      startPos\n      startCursor\n      endPos\n      endCursor\n      hasNextPage\n      unstable\n    }\n  }\n}\n',
    variables: {
      groupBy: null,
      orderBy: { position: 'ASC', deadline: 'DESC', createTime: 'DESC' },
      filterGroup: [{
        project_in: ['YEL8b4LVgWM3n6BK'],
        issueType_in: ['4f89rNoy', 'UQQpmFBi'],
        name_match: name,
      }],
      bucketOrderBy: null,
      search: { keyword: '', aliases: [] },
    },
  }
  return fetch('https://ones.ai/project/api/project/team/RDjYMhKq/items/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  }).then(res => res.json()).then((res) => {
    return res
  })
}
