import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { postJSON, rupees } from '../api.js'

const CHIPS = [
  'Dress for a wedding under ₹2000',
  'Casual shirt for men',
  'Gift for a 5 year old girl',
]

export default function Assistant() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [items, setItems] = useState([
    { who: 'bot', text: 'Hi! Tell me what you are looking for: an occasion, a budget, or a style.' },
  ])
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [items, open])

  async function send(raw) {
    const message = raw.trim()
    if (!message || busy) return
    setText('')
    setBusy(true)
    setItems((prev) => [...prev, { who: 'user', text: message }, { who: 'bot', text: 'Thinking...' }])
    let reply
    try {
      const data = await postJSON('/api/assistant/', { message })
      reply = { who: 'bot', text: data.reply, products: data.products }
    } catch (err) {
      reply = { who: 'bot', text: err.message || 'Sorry, I could not reach the assistant. Please try again.' }
    }
    setItems((prev) => [...prev.slice(0, -1), reply])
    setBusy(false)
  }

  return (
    <>
      <button className="ai-toggle" type="button" onClick={() => setOpen((o) => !o)}>
        ✨ Ask Nostra
      </button>

      {open && (
        <div className="ai-panel">
          <div className="ai-head">
            <strong>Nostra Style Assistant</strong>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
          </div>

          <div className="ai-log" ref={logRef}>
            {items.map((m, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <div className={'ai-msg ' + m.who}>{m.text}</div>
                {m.products && m.products.length > 0 && (
                  <div className="ai-products">
                    {m.products.map((p) => (
                      <Link key={p.id} className="ai-product" to={'/product/' + p.id}>
                        <img src={p.image_url} alt={p.name} />
                        <span>{p.name}</span>
                        <strong>{rupees(p.price)}</strong>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ai-chips">
            {CHIPS.map((c) => (
              <button key={c} type="button" className="ai-chip" onClick={() => send(c)}>{c}</button>
            ))}
          </div>

          <form className="ai-form" onSubmit={(e) => { e.preventDefault(); send(text) }}>
            <input
              type="text"
              maxLength={500}
              placeholder="Ask about fashion..."
              autoComplete="off"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  )
}
