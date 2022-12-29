# changed-files

List changed files for a pull request and save them to files. Inpsired by 
[tj-actions/changed-files](https://github.com/tj-actions/changed-files).

## Usage

File paths are written (line by line) to `.changed-files.<status>.txt`.

```yaml
- name: Get Changed Files
  uses: darmiel/changed-files@v1
  with:
    # GitHub token to use
    # default:    ${{ secrets.GITHUB_TOKEN }}
    token: ${{ secrets.GITHUB_TOKEN }}
    
    # number of the pull request
    # default:    < current pull request >
    pull-request-number: 1
    
    # which states should be tracked
    # default:    added,modified,removed
    # available:  added,removed,modified,renamed,copied,changed,unchanged
    track: added,modified,removed
```

Currently there is not really much more functionality because I don't need more, but if features are wanted, feel free to create a PR or an issue 😊

### Example: Combine multiple states

```yaml
- name: Get Changed Files
  uses: darmiel/changed-files@v1

- name: Combine modified and added files
  run: cat .changed-files.{modified,added}.txt | uniq > changed_file_list.txt
```

## Why?

I needed a way to get the changed files for a pull request (`pull_request_target` event) and save them to a file.
With other actions I had the problem that if the head repository was not correctly synchronized with the base repository, way more files were recognized as changed than it should.
This action uses the GitHub API to get the changed files and therefore should be more (reliable).

> **Note**: This doesn't mean that the other actions don't work, it just means that this is probably just a layer 8 problem, and writing my own action was faster in the end :)
