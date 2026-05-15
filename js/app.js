const DEFAULTS = {
  name: 'Елена Куликова',
  position: 'Дизайн-директор MWS AI',
  phone: '+7 926 875-20-88',
  email: 'e.kulikova@mts.ai',
};

let bodyTemplate = '';
let instructionsTemplate = '';
let openInstr = 'gmail';
let copiedTimer = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getFormData() {
  return {
    name: document.getElementById('field-name').value.trim() || '\u00A0',
    position: document.getElementById('field-position').value.trim() || '\u00A0',
    phone: document.getElementById('field-phone').value.trim() || '\u00A0',
    email: document.getElementById('field-email').value.trim() || '\u00A0',
  };
}

function fillTemplate(template, data) {
  return template
    .replace(/\{\{NAME\}\}/g, escapeHtml(data.name))
    .replace(/\{\{POSITION\}\}/g, escapeHtml(data.position))
    .replace(/\{\{PHONE\}\}/g, escapeHtml(data.phone))
    .replace(/\{\{EMAIL\}\}/g, escapeHtml(data.email));
}

function buildExportHtml(data) {
  return `${fillTemplate(bodyTemplate, data)}\n\n${instructionsTemplate}`;
}

function updatePreview() {
  const data = getFormData();
  document.getElementById('signature-preview').innerHTML = fillTemplate(bodyTemplate, data);
}

function handleDownload() {
  const content = buildExportHtml(getFormData());
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mws-ai-signature.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function handleCopy() {
  const btn = document.getElementById('btn-copy');
  const label = document.getElementById('btn-copy-label');

  try {
    await navigator.clipboard.writeText(buildExportHtml(getFormData()));
    label.textContent = 'Скопировано';
    btn.querySelector('.icon-copy').classList.add('hidden');
    btn.querySelector('.icon-check').classList.remove('hidden');
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      label.textContent = 'Копировать код';
      btn.querySelector('.icon-copy').classList.remove('hidden');
      btn.querySelector('.icon-check').classList.add('hidden');
    }, 1800);
  } catch (e) {
    console.error(e);
  }
}

function formatStepHtml(step) {
  return step
    .replace(/%APPDATA%\\Microsoft\\Signatures/g, '<code class="font-mono text-[13px] bg-neutral-100 px-1.5 py-0.5">%APPDATA%\\Microsoft\\Signatures</code>')
    .replace(/<body>/g, '<code class="font-mono text-[13px] bg-neutral-100 px-1.5 py-0.5">&lt;body&gt;</code>')
    .replace(/<table>/g, '<code class="font-mono text-[13px] bg-neutral-100 px-1.5 py-0.5">&lt;table&gt;</code>')
    .replace(/<\/table>/g, '<code class="font-mono text-[13px] bg-neutral-100 px-1.5 py-0.5">&lt;/table&gt;</code>');
}

const INSTRUCTIONS = [
  {
    id: 'gmail',
    title: 'Gmail',
    steps: [
      'Нажмите «Скачать HTML» и откройте файл двойным кликом в браузере.',
      'Выделите подпись (Ctrl/Cmd + A) и скопируйте (Ctrl/Cmd + C).',
      'В Gmail откройте «Настройки» (шестерёнка) → «Все настройки» → «Общие».',
      'В разделе «Подпись» нажмите «Создать новую» и вставьте (Ctrl/Cmd + V).',
      'Прокрутите вниз и нажмите «Сохранить изменения».',
    ],
  },
  {
    id: 'outlook-new',
    title: 'Outlook (новый, Mac, Web)',
    steps: [
      'Откройте скачанный HTML-файл в браузере, скопируйте подпись.',
      'В Outlook: «Файл» → «Параметры» → «Почта» → «Подписи» → «Создать».',
      'Вставьте подпись в поле и сохраните.',
    ],
  },
  {
    id: 'outlook-classic',
    title: 'Outlook (классический, Windows)',
    steps: [
      'Outlook → «Файл» → «Параметры» → «Почта» → «Подписи» → «Создать», задайте имя и оставьте окно открытым.',
      'В проводнике откройте папку: %APPDATA%\\Microsoft\\Signatures',
      'Найдите файл с именем подписи и расширением .htm, откройте в Блокноте.',
      'Замените содержимое тега <body> на код из скачанного файла (от <table> до </table>).',
      'Сохраните файл. Закройте и снова откройте окно подписей в Outlook.',
    ],
  },
];

function renderInstructions() {
  const root = document.getElementById('instructions-list');
  root.innerHTML = INSTRUCTIONS.map((inst, index) => {
    const isOpen = openInstr === inst.id;
    const steps = inst.steps.map((step, i) => `
      <li class="flex gap-4">
        <span class="font-mono text-[11px] tracking-wider text-neutral-400 pt-1 shrink-0">${String(i + 1).padStart(2, '0')}</span>
        <span>${formatStepHtml(step)}</span>
      </li>
    `).join('');

    return `
      <div class="border-b hairline" data-instr-id="${inst.id}">
        <button type="button" class="instr-toggle w-full flex items-center justify-between py-4 sm:py-5 text-left group">
          <div class="flex items-baseline gap-6">
            <span class="font-mono text-[11px] tracking-[0.2em] uppercase text-neutral-400 hidden sm:inline">${String(index + 1).padStart(2, '0')}</span>
            <span class="font-display text-2xl sm:text-3xl">${inst.title}</span>
          </div>
          <svg class="chevron btn-icon" data-open="${isOpen}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="instr-panel" data-open="${isOpen}" ${isOpen ? 'style="padding-bottom:1.25rem"' : ''}>
          <div class="instr-panel__inner">
            <ol class="font-body text-base text-neutral-700 leading-relaxed max-w-3xl space-y-3 sm:pl-[3.75rem]">${steps}</ol>
          </div>
        </div>
      </div>
    `;
  }).join('');

  root.querySelectorAll('.instr-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-instr-id]').dataset.instrId;
      openInstr = openInstr === id ? '' : id;
      renderInstructions();
    });
  });
}

async function loadTemplates() {
  try {
    const [bodyRes, instrRes] = await Promise.all([
      fetch('templates/signature.template.html'),
      fetch('templates/signature-instructions.html'),
    ]);
    if (!bodyRes.ok || !instrRes.ok) throw new Error('fetch failed');
    bodyTemplate = await bodyRes.text();
    instructionsTemplate = await instrRes.text();
  } catch {
    const bodyEl = document.getElementById('tpl-body');
    const instrEl = document.getElementById('tpl-instructions');
    if (!bodyEl || !instrEl) {
      throw new Error('Шаблоны не загружены. Откройте сайт через HTTP (GitHub Pages или локальный сервер).');
    }
    bodyTemplate = bodyEl.textContent.trim();
    instructionsTemplate = instrEl.textContent.trim();
  }
}

function bindForm() {
  ['name', 'position', 'phone', 'email'].forEach((key) => {
    document.getElementById(`field-${key}`).addEventListener('input', updatePreview);
  });
  document.getElementById('btn-download').addEventListener('click', handleDownload);
  document.getElementById('btn-copy').addEventListener('click', handleCopy);
}

function setDefaults() {
  document.getElementById('field-name').value = DEFAULTS.name;
  document.getElementById('field-position').value = DEFAULTS.position;
  document.getElementById('field-phone').value = DEFAULTS.phone;
  document.getElementById('field-email').value = DEFAULTS.email;
}

async function init() {
  try {
    await loadTemplates();
    setDefaults();
    bindForm();
    renderInstructions();
    updatePreview();
    document.getElementById('app-loading').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  } catch (e) {
    document.getElementById('app-loading').innerHTML =
      `<p class="font-body text-red-600">${escapeHtml(e.message)}</p>`;
  }
}

init();
