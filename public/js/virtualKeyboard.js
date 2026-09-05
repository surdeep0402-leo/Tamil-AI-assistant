/**
 * Tamil Virtual On-Screen Keyboard
 * Inserts characters directly into the currently focused or active input element.
 */

const VIRTUAL_KEYS = {
  uyir: ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'],
  mei: ['க்', 'ங்', 'ச்', 'ஞ்', 'ட்', 'ண்', 'த்', 'ந்', 'ப்', 'ம்', 'ய்', 'ர்', 'ல்', 'வ்', 'ழ்', 'ள்', 'ற்', 'ன்'],
  signs: ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்']
};

let activeInputElement = null;

function setTargetInput(el) {
  activeInputElement = el;
}

function initVirtualKeyboard(containerId = 'virtualKeyboardContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="vk-wrapper">
      <div class="vk-header">
        <div class="vk-tabs">
          <button class="vk-tab active" data-tab="uyir">உயிர் & ஆய்தம் (13)</button>
          <button class="vk-tab" data-tab="mei">மெய் எழுத்து (18)</button>
          <button class="vk-tab" data-tab="signs">உயிர்மெய்க் குறிகள்</button>
        </div>
        <div class="vk-actions">
          <button class="vk-btn vk-btn-sm" id="vkBackspaceBtn" title="அழி">⌫ அழி</button>
          <button class="vk-btn vk-btn-sm" id="vkSpaceBtn" title="இடைவெளி">␣ இடைவெளி</button>
          <button class="vk-btn vk-btn-close" id="vkCloseBtn" title="மூடு">✕</button>
        </div>
      </div>
      <div class="vk-grid" id="vkKeyGrid"></div>
    </div>
  `;

  const keyGrid = container.querySelector('#vkKeyGrid');
  const tabs = container.querySelectorAll('.vk-tab');
  const backspaceBtn = container.querySelector('#vkBackspaceBtn');
  const spaceBtn = container.querySelector('#vkSpaceBtn');
  const closeBtn = container.querySelector('#vkCloseBtn');

  function renderKeys(tabName) {
    keyGrid.innerHTML = '';
    const keys = VIRTUAL_KEYS[tabName] || VIRTUAL_KEYS.uyir;

    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vk-key';
      btn.textContent = k;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        insertCharacter(k);
      });
      keyGrid.appendChild(btn);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderKeys(tab.dataset.tab);
    });
  });

  backspaceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    deleteLastCharacter();
  });

  spaceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    insertCharacter(' ');
  });

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove('active');
    const toggleBtn = document.getElementById('toggleKeyboardBtn');
    if (toggleBtn) toggleBtn.classList.remove('active');
  });

  // Track focused inputs automatically
  document.addEventListener('focusin', (e) => {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) {
      activeInputElement = e.target;
    }
  });

  // Default render
  renderKeys('uyir');
}

function insertCharacter(char) {
  const el = activeInputElement || document.getElementById('grammarInput') || document.getElementById('chatInput');
  if (!el) return;

  const start = el.selectionStart || el.value.length;
  const end = el.selectionEnd || el.value.length;
  const val = el.value;

  el.value = val.substring(0, start) + char + val.substring(end);
  el.focus();
  el.selectionStart = el.selectionEnd = start + char.length;

  // Trigger input event for live reactive listeners
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function deleteLastCharacter() {
  const el = activeInputElement || document.getElementById('grammarInput') || document.getElementById('chatInput');
  if (!el || !el.value) return;

  const start = el.selectionStart || el.value.length;
  const end = el.selectionEnd || el.value.length;
  const val = el.value;

  if (start !== end) {
    el.value = val.substring(0, start) + val.substring(end);
    el.selectionStart = el.selectionEnd = start;
  } else if (start > 0) {
    el.value = val.substring(0, start - 1) + val.substring(start);
    el.selectionStart = el.selectionEnd = start - 1;
  }

  el.focus();
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

window.initVirtualKeyboard = initVirtualKeyboard;
window.setTargetInput = setTargetInput;
window.insertCharacter = insertCharacter;
