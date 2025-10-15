export default function decorate(block) {
  // mark the section for special spacing
  const section = block.closest('.section');
  if (section) section.classList.add('hero-image');

  // find the image and mark its wrapper
  const img = block.querySelector('img');
  if (!img) return;

  // ensure the image isn't constrained by a <p>
  const p = img.closest('p');
  if (p) p.classList.add('hero-media');

  // optional: allow a fixed viewport height via style tokens
  // e.g. add "height-60vh" in the block's Section Metadata -> Styles
  const styles = section?.dataset?.style || '';
  if (styles.includes('height-60vh')) img.style.maxHeight = '60vh';
}