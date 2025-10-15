// blocks/container/container.js
// Authoring expected: a 2-column table -> Title | Body
export default function decorate(block) {
  const table = block.querySelector('table');
  if (!table) return;

  const firstRow = table.querySelector('tr');
  if (!firstRow) return;

  const [titleCell, bodyCell] = firstRow.querySelectorAll('td, th');

  // Title: prefer existing heading element if present; else make one.
  let headingEl = titleCell?.querySelector('h1,h2,h3');
  if (!headingEl) {
    headingEl = document.createElement('h1');
    headingEl.textContent = (titleCell?.textContent || '').trim();
  } else {
    // clone to avoid moving authoring node out of table in some editors
    headingEl = headingEl.cloneNode(true);
    // normalize to <h1> look regardless of original level
    headingEl = Object.assign(document.createElement('h1'), { textContent: headingEl.textContent });
  }

  // Body copy (rich text allowed)
  const copy = document.createElement('div');
  copy.className = 'container-copy';
  copy.innerHTML = bodyCell?.innerHTML || '';

  // Build final structure
  const inner = document.createElement('div');
  inner.className = 'container-inner';
  inner.append(headingEl, copy);

  // Replace table with our markup
  block.innerHTML = '';
  block.append(inner);

  // Optional: if author added multiple rows, append their bodies as extra paragraphs
  const extraRows = [...table.querySelectorAll('tr')].slice(1);
  extraRows.forEach((tr) => {
    const cells = tr.querySelectorAll('td');
    if (cells[1]) {
      const extra = document.createElement('p');
      extra.innerHTML = cells[1].innerHTML;
      copy.append(extra);
    }
  });
}
