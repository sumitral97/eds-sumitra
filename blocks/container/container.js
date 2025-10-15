export default function decorate(block) {
  const table = block.querySelector('table');
  if (!table) return;

  const firstRow = table.querySelector('tr');
  if (!firstRow) return;

  const [titleCell, bodyCell] = firstRow.querySelectorAll('td, th');

  let headingEl = titleCell?.querySelector('h1,h2,h3');
  if (!headingEl) {
    headingEl = document.createElement('h1');
    headingEl.textContent = (titleCell?.textContent || '').trim();
  } else {
    headingEl = headingEl.cloneNode(true);
    headingEl = Object.assign(document.createElement('h1'), { textContent: headingEl.textContent });
  }
  const copy = document.createElement('div');
  copy.className = 'container-copy';
  copy.innerHTML = bodyCell?.innerHTML || '';
  const inner = document.createElement('div');
  inner.className = 'container-inner';
  inner.append(headingEl, copy);
  block.innerHTML = '';
  block.append(inner);

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
