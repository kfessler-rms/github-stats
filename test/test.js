let assert = require('assert')
let expect = require('chai').expect

let fs = require('fs')
let path = require('path')
let filePath = path.join(__dirname, './fixtures/')
describe('Non connected functions', function () {
  describe('Testing fixtures', function () {
    it('should have an array with 26 items', function () {
      let data = JSON.parse(fs.readFileSync(filePath + 'aarlaud-snyk', 'utf8'))
      assert.equal(data.length, 26)
    })

    it('should have an aarlaud with 3 commits in github-stats', function (done) {
      fs.readFile(filePath + 'aarlaud-snyk', 'utf8', function (err, contents) {
        let data = JSON.parse(contents)
        if (err) {
          done(err)
        }
        for (let i = 0; i < data.length; i++) {
          if (data[i].name === 'github-stats') {
            assert.equal(data[i].contributorsList[0]['# of commits'], 3)
            done()
          }
        }
      })
    })
  })
  describe('Testing consolidateContributorsList()', function () {
    let convert = require('../contributors.js')
    it('should return 1 active contributors for repos', function (done) {
      convert.consolidateContributorsList(filePath, 'aarlaud-snyk')
        .then((result) => {
          expect(result).to.have.property('list')
          expect(result['list']).to.have.property('aarlaud').and.to.have.deep.property('# of commits', 5)
          done()
        })
    })
    it('should return 25 active contributors for the forked repos', function (done) {
      convert.consolidateContributorsList(filePath, 'aarlaud-snyk')
        .then((result) => {
          expect(result).to.have.property('forkedList')
          expect(result['forkedList']).to.have.property('aarlaud').and.to.have.deep.property('# of commits', 14)

          done()
        })
    })
  })
})

describe('Connected functions', function () {
  describe('Testing Github Authentication', function () {
    const githubUtils = require('../github.js')

    it('should authenticate with token - fail for unknown repos', function (done) {
      let options = { 'token': process.env.GITHUB_TOKEN }
      let githubHandler = githubUtils.authenticate(options)

      githubHandler.get('/repos/doowb/fooobarbaz')
      .then(() => {
        fail()
      })
      .catch((err) => {
        assert.equal(err.message, "Not Found")
        done()
      });

      
    })

    it('should authenticate with token - works for known repos', function (done) {
      let options = { 'token': process.env.GITHUB_TOKEN }
      let githubHandler = githubUtils.authenticate(options)

      githubHandler.get('/repos/snyk/snyk')
      .then((data) => {
        done()
      })
      .catch((err) => {
        fail()
      })
    })
  })
})
