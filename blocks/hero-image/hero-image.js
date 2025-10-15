export default function decorate(block) {
  const section = block.closest('.section');
  if (section) section.classList.add('hero-image');
  const img = block.querySelector('img');
  if (!img) return;
  const p = img.closest('p');
  if (p) p.classList.add('hero-media');
  const styles = section?.dataset?.style || '';
  if (styles.includes('height-60vh')) img.style.maxHeight = '60vh';
}