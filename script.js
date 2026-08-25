const panels = document.querySelectorAll('.panel');
const buttons = document.querySelectorAll('.nav-button');

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

function storyMarkup(text) {
  return `<div class="story-text">${text.trim().split(/\n\s*\n/).map((paragraph) => {
    const clean = escapeHtml(paragraph.trim());
    const dialogue = /^[「『]/.test(clean) ? ' class="dialogue"' : '';
    return `<p${dialogue}>${clean}</p>`;
  }).join('')}</div>`;
}

function notesMarkup(text) {
  const lines = text.trim().split('\n');
  const output = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) output.push('</ul>');
    listOpen = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
    } else if (line.startsWith('■ ')) {
      closeList();
      output.push(`<h2>${escapeHtml(line.slice(2))}</h2>`);
    } else if (/^・/.test(line)) {
      if (!listOpen) output.push('<ul>');
      listOpen = true;
      output.push(`<li>${escapeHtml(line.slice(1))}</li>`);
    } else if (line === '『現行版』解説') {
      continue;
    } else {
      closeList();
      output.push(`<p>${escapeHtml(line)}</p>`);
    }
  }
  closeList();
  return output.join('');
}

async function loadText(target, filename, formatter) {
  try {
    const response = await fetch(filename);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    target.innerHTML = formatter(await response.text());
  } catch (error) {
    target.innerHTML = `<p class="error">読み込みに失敗しました：${escapeHtml(error.message)}</p>`;
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    buttons.forEach((item) => item.classList.toggle('active', item === button));
    panels.forEach((panel) => panel.classList.toggle('active', panel.id === button.dataset.view));
    window.scrollTo({ top: document.querySelector('.hero').offsetHeight, behavior: 'smooth' });
  });
});

loadText(document.querySelector('#story'), `${encodeURI('現行版_v3.txt')}?v=v3-11`, storyMarkup);
loadText(document.querySelector('#notes'), `${encodeURI('現行版_v3.txt.read')}?v=v3-11`, notesMarkup);
