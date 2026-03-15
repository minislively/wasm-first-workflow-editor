import { readFile } from 'node:fs/promises'
import path from 'node:path'

for (const name of ['100-nodes.json', '500-nodes.json', '1000-nodes.json']) {
  const file = path.resolve('benchmarks/fixtures', name)
  const document = JSON.parse(await readFile(file, 'utf8'))

  console.log(
    `${name}: ${document.nodes.length} nodes / ${document.edges.length} edges`,
  )
}
