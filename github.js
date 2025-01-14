let GitHub = require('github-base')
let chalk = require('chalk')

const interpretResponseCode = (statusCode) => {
  let response = ''
  switch (statusCode) {
    case 200:
    case 204:
      response = 'OK'
      break
    case 202:
      response = 'Github received listing request and is processing data. Please try again in a moment'
      break
    case 404:
      response = 'Organization cannot be found.'
      break
    case 403:
      response = 'Access Denied'
      break
    default:
      response = 'Unexpected response code: ' + statusCode
  }
  return response
}

const authenticate = (options) => {
  let githubHandler
  let apiurl = 'https://api.github.com'
  if (options.apiurl) {
    if (options.apiurl.substring(0, 8) !== 'https://' || !options.apiurl.includes('/api/v3')) {
      console.log('The api url should look like https://mygheinstanceurl.mycompany.com/api/v3')
      process.exit(1)
    }
    // console.log(options.apiurl.includes('/api/v3'));
    // if(options.apiurl.substring(0,7))
    apiurl = options.apiurl
  }
  if (options.token) {
    githubHandler = new GitHub({
      token: options.token,
      apiurl: apiurl
    })
  } else if (options.username && options.password) {
    githubHandler = new GitHub({
      username: options.username,
      password: options.password,
      apiurl: apiurl
    })
  } else {
    console.error(chalk.red('Invalid input ! Must provide token or username/password'))
    process.exit(1)
  }
  return githubHandler
}

const getGithubOrgList = (githubHandler, orgName, privateReposOnly) => {
  return new Promise((resolve, reject) => {
    let url = '/orgs/' + orgName + '/repos?type=all'
    if (privateReposOnly) url = '/orgs/' + orgName + '/repos?type=private'
    githubHandler.paged(url)
      .then((res) => {
        let interpretedResponse = interpretResponseCode(res.pages[0].statusCode)
        if (interpretedResponse === 'OK') {
          let repos = []
          if (res.pages.length > 1) {
            repos = pageCondenser(res.pages)
          } else {
            repos = res.pages[0]
          }
          resolve(repos)
        } else {
          reject(interpretedResponse)
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const pageCondenser = (pages) => {
  let allBodies = []
  for (let pageIndex in pages) {
    allBodies = allBodies.concat(pages[pageIndex].body)
  }
  // console.log(allBodies)
  return allBodies
}

module.exports = { interpretResponseCode, authenticate, getGithubOrgList, pageCondenser }
