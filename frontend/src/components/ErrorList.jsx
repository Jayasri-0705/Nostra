export default function ErrorList({ list }) {
  if (!list || list.length === 0) return null
  return (
    <ul className="errorlist">
      {list.map((m, i) => <li key={i}>{m}</li>)}
    </ul>
  )
}
