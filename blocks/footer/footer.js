export default function decorate(block) {
  const rows = [...block.children];
  const key = (r) => (r?.children?.[0]?.textContent || '').trim().toLowerCase();
  const cells = (r) => [...(r?.children || [])].slice(1);
  const all = (label) => rows.filter((r) => key(r) === label);
  const first = (label) => all(label)[0];

  // sanity: ignore accidental empty footer blocks
  const hasMeaningfulRows = ['brand', 'links', 'divider', 'bottom']
    .some((label) => all(label).length > 0);
  if (!hasMeaningfulRows) {
    const next = block.nextElementSibling;
    block.remove();
    // also clean up immediate consecutive empty siblings
    let cursor = next;
    while (
      cursor &&
      cursor.classList?.contains('footer') &&
      cursor.classList?.contains('block') &&
      cursor.children.length === 0 &&
      cursor.textContent.trim() === ''
    ) {
      const nxt = cursor.nextElementSibling;
      cursor.remove();
      cursor = nxt;
    }
    return;
  }

  // --- config (cols:1-4) from first row "cols: N"
  const cfg = cells(rows[0] || []).map((c) => (c.textContent || '').trim());
  const getCfg = (k) =>
    cfg.find((t) => t.toLowerCase().startsWith(`${k}:`))?.split(':').slice(1).join(':').trim() || '';
  const linkCols = Math.max(1, Math.min(4, parseInt(getCfg('cols') || '4', 10)));

  // --- brand (logo + address as authored)
  const brandRow = first('brand');
  let logoHTML = '', addressHTML = '';
  if (brandRow) {
    const cs = cells(brandRow);
    const img = cs[0]?.querySelector('img, picture');
    logoHTML = `<div class="brand-logo">${img ? img.outerHTML : (cs[0]?.innerHTML || '')}</div>`;
    // we intentionally extract address separately; it will be placed UNDER the links
    if (cs[1]) addressHTML = `<address class="brand-address moved-address">${cs[1].innerHTML}</address>`;
  }

  // --- links (normalize each cell to <a> or <span>)
  const normalizeCell = (td) => {
    const a = td.querySelector('a');
    if (a) return `<a href="${a.getAttribute('href') || '#'}">${a.textContent.trim()}</a>`;
    const raw = (td.textContent || '').trim();
    if (!raw) return '';
    let label = raw, href = '';
    if (raw.includes('|')) {
      [label, href] = raw.split('|').map((s) => s.trim());
    } else if (raw.includes('/')) {
      const [l, r] = raw.split('/');
      if (l && r && !/\s/.test(r)) { label = l.trim(); href = `/${r.replace(/^\//, '')}`; }
    }
    return href ? `<a href="${href}">${label}</a>` : `<span>${label}</span>`;
  };
  const linkRows = all('links').map((r) => cells(r).slice(0, 4).map(normalizeCell));

  // --- divider
  const hasDivider = all('divider').length > 0;

  // --- bottom (two texts, each in its own row)
  const bottomRows = all('bottom').map((r) => cells(r).map((c) => c.innerHTML));
  const bottomLeftRaw = bottomRows[0]?.[0] || '';
  const bottomRight = bottomRows[1]?.[0] || '';

  // build HTML
  block.innerHTML = `
    <footer class="site-footer v2">
      <div class="top">
        <div class="brand-col">
          ${logoHTML}
        </div>
        <div class="links" style="--link-cols:${linkCols}">
          ${linkRows.map((row) => `
            <ul class="link-row">
              ${row.map((cell) => `<li>${cell || ''}</li>`).join('')}
            </ul>
          `).join('')}
        </div>
        ${addressHTML || ''}  <!-- address is now BELOW the links, spans full width via CSS -->
      </div>
      ${hasDivider ? '<hr class="divider" />' : ''}
      ${(bottomLeftRaw || bottomRight) ? `
        <div class="bottom">
          <div class="bottom-left">${bottomLeftRaw}</div>
          <div class="bottom-right">${bottomRight}</div>
        </div>` : ''}
    </footer>
  `;

  // post-render: split license into two stacked lines if authored as one with " "
  const bottomLeft = block.querySelector('.site-footer.v2 .bottom-left');
  if (bottomLeft) {
    const text = bottomLeft.textContent.trim();
    if (text.includes(' ')) {
      const [firstLine, ...rest] = text.split(' ');
      const secondLine = rest.join(' ');
      bottomLeft.innerHTML =
        `<span class="license-line">${firstLine.trim()}</span>` +
        `<span class="license-line">${secondLine.trim()}</span>`;
    }
  }

  // clean duplicate empty footer blocks around this one
  block.querySelectorAll('.footer.block').forEach((dup) => dup.remove());
  const isEmptyFooterBlock = (el) =>
    el &&
    el.classList?.contains('footer') &&
    el.classList?.contains('block') &&
    el.children.length === 0 &&
    el.textContent.trim() === '';
  ['previousElementSibling', 'nextElementSibling'].forEach((dir) => {
    let el = block[dir];
    while (isEmptyFooterBlock(el)) {
      const nxt = el[dir];
      el.remove();
      el = nxt;
    }
  });
}
