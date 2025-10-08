export default function decorate(block) {
  const rows = [...block.children];
  const key = (r) => (r?.children?.[0]?.textContent || '').trim().toLowerCase();
  const cells = (r) => [...(r?.children || [])].slice(1);
  const all = (label) => rows.filter((r) => key(r) === label);
  const first = (label) => all(label)[0];

  // config
  const cfg = cells(rows[0] || []).map((c) => (c.textContent || '').trim());
  const getCfg = (k) =>
    cfg.find((t) => t.toLowerCase().startsWith(`${k}:`))?.split(':').slice(1).join(':').trim() || '';
  const linkCols = Math.max(1, Math.min(4, parseInt(getCfg('cols') || '4', 10)));

  // brand (logo image + address column)
  const brandRow = first('brand');
  let logoHTML = '', addressHTML = '';
  if (brandRow) {
    const cs = cells(brandRow);
    const img = cs[0]?.querySelector('img, picture');
    logoHTML = `<div class="brand-logo">${img ? img.outerHTML : (cs[0]?.innerHTML || '')}</div>`;
    addressHTML = cs[1] ? `<address class="brand-address">${cs[1].innerHTML}</address>` : '';
  }

  // links: 4 columns, up to 5 rows 
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

  // divider
  const hasDivider = all('divider').length > 0;

  // bottom (two texts, each in its own row)
  const bottomRows = all('bottom').map((r) => cells(r).map((c) => c.innerHTML));
  const bottomLeft = bottomRows[0]?.[0] || '';
  const bottomRight = bottomRows[1]?.[0] || '';

  
  block.innerHTML = `
    <footer class="site-footer v2">
      <div class="top">
        <div class="brand-col">
          ${logoHTML}
          ${addressHTML}
        </div>
        <div class="links" style="--link-cols:${linkCols}">
          ${linkRows.map((row) => `
            <ul class="link-row">
              ${row.map((cell) => `<li>${cell || ''}</li>`).join('')}
            </ul>
          `).join('')}
        </div>
      </div>
      ${hasDivider ? '<hr class="divider" />' : ''}
      ${(bottomLeft || bottomRight) ? `
        <div class="bottom">
          <div class="bottom-left">${bottomLeft}</div>
          <div class="bottom-right">${bottomRight}</div>
        </div>` : ''}
    </footer>
  `;
  block.querySelectorAll('.footer.block').forEach((dup) => dup.remove());
}
