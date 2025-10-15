export default function decorate(block) {
  const table = block.querySelector('table');
  let rows = [];
  let mode = 'table';

  if (table) {
    rows = [...table.querySelectorAll('tr')];
  } else {
    mode = 'divgrid';
    const rowNodes = [...block.children];
    if (rowNodes.length === 1 && rowNodes[0].children?.length) {
      rows = [...rowNodes[0].children];
    } else {
      rows = rowNodes;
    }
  }
if (!rows.length) {
    return;
  }
  const getText = (el) => (el?.textContent || '').trim().toLowerCase();
  const getCells = (row) => {
    if (mode === 'table') return [...row.querySelectorAll('td,th')];
    const cells = row ? [...row.children] : [];
    return cells;
  };

  let dataRows = rows;
  const firstCells = getCells(rows[0]);
  const headerGuess = firstCells.length >= 3 && (
    getText(firstCells[0]).includes('image') ||
    getText(firstCells[1]).includes('title') ||
    getText(firstCells[2]).includes('body')
  );
  if (headerGuess) dataRows = rows.slice(1);

  const list = document.createElement('ul');
  list.className = 'cc-grid';

  dataRows.forEach((row) => {
    const cells = getCells(row);
    const [imgCell, titleCell, bodyCell] = cells;

    const li = document.createElement('li');
    li.className = 'cc-card';
    const media = imgCell?.querySelector?.('picture, img');
    if (media) {
      const wrap = document.createElement('div');
      wrap.className = 'cc-media';
      wrap.append(media.cloneNode(true));
      li.append(wrap);
    }

    const panel = document.createElement('div');
    panel.className = 'cc-panel';

    const titleText = (titleCell?.textContent || '').trim();
    if (titleText) {
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      panel.append(h3);
    }

    const bodyHTML = bodyCell?.innerHTML || '';
    if (bodyHTML) {
      const copy = document.createElement('div');
      copy.className = 'cc-copy';
      copy.innerHTML = bodyHTML;
      panel.append(copy);
    }

    li.append(panel);
    list.append(li);
  });
  block.innerHTML = '';
  block.append(list);
}
