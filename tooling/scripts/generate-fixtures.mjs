import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outputDir = path.resolve('benchmarks/fixtures')

await mkdir(outputDir, { recursive: true })

for (const count of [100, 500, 1000]) {
  const document = createFixture(count)
  const target = path.join(outputDir, `${count}-nodes.json`)
  await writeFile(target, JSON.stringify(document, null, 2))
}

console.log('Generated benchmark fixtures in benchmarks/fixtures')

function createFixture(count) {
  const columns = Math.max(5, Math.round(Math.sqrt(count)))

  const nodes = Array.from({ length: count }, (_, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)

    return {
      id: `node-${index + 1}`,
      type: 'task',
      title: `Node ${index + 1}`,
      subtitle: 'Fixture node',
      status: index % 5 === 0 ? 'running' : 'ready',
      position: {
        x: column * 220,
        y: row * 128,
      },
      size: {
        width: 176,
        height: 84,
      },
      color: index % 2 === 0 ? '#38bdf8' : '#f97316',
    }
  })

  const edges = nodes.slice(1).map((node, index) => ({
    id: `edge-${index + 1}`,
    source: nodes[Math.max(0, index - 1)].id,
    target: node.id,
  }))

  return {
    version: '0.1.0',
    nodes,
    edges,
  }
}
