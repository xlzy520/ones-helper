import { GithubBranchParam } from '~/common/types'

export const getGithubOAuthToken = (): Promise<any> => {
  return browser.storage.local.get('githubAccessToken').then((res: any) => {
    return res.githubAccessToken
  })
}

const baseUrl = 'https://api.github.com/'
let token = ''
getGithubOAuthToken().then((res) => {
  token = res
})

export const githubFetch = (url: string, options = {}) => {
  return fetch(baseUrl + url, {
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    ...options,
  }).then(res => res.json()).then((res) => {
    console.log(res)
    if (res.message) {
      return Promise.reject(res.message)
    }
    return res
  })
}

export const fetchLatestRelease = () => {
  return githubFetch('repos/xlzy520/ones-helper/releases/latest')
}

export const fetchBranchList = ({ owner, repo }: GithubBranchParam) => {
  return githubFetch(`repos/${owner}/${repo}/git/refs`)
}

export const fetchBranchSHA = ({ owner, repo, head }: GithubBranchParam) => {
  return githubFetch(`repos/${owner}/${repo}/git/refs/heads/${head}`).then((res) => {
    return res.object.sha
  })
}

export const createNewBranch = ({ owner, repo, ref, sha }: GithubBranchParam) => {
  return githubFetch(`repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({
      owner,
      repo,
      ref: `refs/heads/${ref}`,
      sha,
    }),
  })
}
