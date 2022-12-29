import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'

const PER_PAGE = 100

async function run(): Promise<void> {
  try {
    let prNumber: number
    // get pull request number from input
    if (core.getInput('pull-request-number') !== '') {
      try {
        prNumber = parseInt(core.getInput('pull-request-number'))
      } catch (error) {
        throw new Error('Could not parse pull request number from input.')
      }
    } else {
      // get pull request number from context
      if (github.context.payload.pull_request?.number) {
        prNumber = github.context.payload.pull_request.number
      } else {
        throw new Error(
          'Could not get pull request number from context. This action only works on pull_request events.'
        )
      }
    }
    core.debug(`PR Number: ${prNumber}`)

    // get what status to check for
    const status: string[] = []
    if (core.getInput('track') !== '') {
      status.push(...core.getInput('track').split(','))
    } else {
      // add default status
      status.push('modified', 'added', 'removed')
    }
    core.debug(`Status: ${status}`)

    const kit = github.getOctokit(core.getInput('token', {required: true}))
    const files = []

    // get files changed in pull request
    let page = 1
    do {
      const result = await kit.rest.pulls.listFiles({
        ...github.context.repo,
        pull_number: prNumber,
        per_page: PER_PAGE,
        page
      })
      files.push(...result.data)
      core.debug(`Page: ${page} - Files: ${result.data.length}`)
      if (result.data.length < PER_PAGE) {
        break
      }
      page += 1
    } while (page <= 30) // 3_000 files maximum reported by GitHub

    core.info(`Total files changed in PR: ${files.length}`)

    // .changed-files.modified.txt
    const fileData: Record<string, string> = {}

    // add to fileData output
    for (const file of files) {
      const st = `${file.status}`
      if (!status.includes(st)) {
        continue
      }
      if (!(st in fileData)) {
        fileData[st] = ''
      }
      fileData[st] += `${file.filename}\n`
    }

    // write to files
    for (const key of status) {
      const data = fileData[key] || ''
      fs.writeFileSync(`.changed-files.${key}.txt`, data)
      core.info(`Wrote to file: .changed-files.${key}.txt (l: ${data.length})`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
