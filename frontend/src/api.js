function getCookie(name) {
  const part = document.cookie.split('; ').find((row) => row.startsWith(name + '='))
  return part ? decodeURIComponent(part.split('=')[1]) : ''
}

async function readJSON(res) {
  let data = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }
  if (!res.ok) {
    const err = new Error(data.detail || 'Request failed: ' + res.status)
    err.status = res.status
    err.errors = data.errors || null
    throw err
  }
  return data
}

export async function getJSON(url) {
  const res = await fetch(url, { credentials: 'same-origin' })
  return readJSON(res)
}

export async function postJSON(url, body = {}) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify(body),
  })
  return readJSON(res)
}

// Field errors from Django, or one general message
export const errorMap = (err) => err.errors || { __all__: [err.message] }

// Same style as Django: 1500 -> ₹1500, 1499.5 -> ₹1499.50
export function rupees(value) {
  const n = Number(value)
  return '₹' + (Number.isInteger(n) ? n : n.toFixed(2))
}
