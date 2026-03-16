import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'
import { WorkflowEditor } from '@minislively/workflow-react'

import './App.css'

function App() {
  const events = ['Host ready: React is hosting the same custom element contract']
  const graph = createBasicDemoGraph()

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">react host demo</p>
          <h1>Use React as the host shell, not as the graph engine.</h1>
          <p className="lede">
            The wrapper stays thin and delegates the interactive stage to the same
            underlying custom element. That keeps the adoption path pleasant
            without turning React into the hot path.
          </p>
        </div>
        <div className="host-panel">
          <h2>Host activity</h2>
          <ul>
            {events.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </div>
      </section>

      <WorkflowEditor
        graph={graph}
        theme={{
          accent: '#22c55e',
          nodeSelected: '#22c55e',
        }}
        className="editor"
      />
    </main>
  )
}

export default App
