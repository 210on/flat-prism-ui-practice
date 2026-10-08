/* Demo interactions only. prism-ui.js is the reusable library. */
(() => {
  const root = document.getElementById('prism-ui');
  const feedback = root.querySelector('#prism-feedback');
  const {accept, shimmer} = window.PrismUI;
  const SAVE_PENDING_MS = 1700;
  const SAVE_DONE_MS = 1400;

  function pulseIcons(element) {
    element.querySelectorAll('svg,[data-prism-icon]').forEach(icon => {
      icon.classList.remove('prism-icon-pulse');
      void icon.getBoundingClientRect();
      icon.classList.add('prism-icon-pulse');
    });
  }

  function initPrismWord() {
    const word = root.querySelector('.prism-word');
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        word.classList.add('prism-word-play');
        observer.disconnect();
      }
    }, {threshold: .3});
    observer.observe(word);
    word.addEventListener('click', () => {
      observer.disconnect();
      word.classList.remove('prism-word-play', 'prism-word-replay');
      void word.offsetWidth;
      word.classList.add('prism-word-play', 'prism-word-replay');
    });
  }

  function initSaveDemo() {
    const button = root.querySelector('#prism-save-demo');
    const status = root.querySelector('#prism-save-status');
    let timers = [];

    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      timers.forEach(clearTimeout);
      timers = [];
      button.classList.remove('prism-save-complete', 'prism-save-done', 'prism-shimmer');
      button.replaceChildren();
      const spinner = document.createElement('span');
      spinner.className = 'prism-spinner';
      spinner.setAttribute('aria-hidden', 'true');
      button.append(spinner, document.createTextNode('保存中…'));
      button.setAttribute('aria-busy', 'true');
      button.setAttribute('aria-disabled', 'true');
      status.textContent = '保存中';

      timers.push(setTimeout(() => {
        button.setAttribute('aria-busy', 'false');
        button.classList.add('prism-save-complete');
        button.replaceChildren();
        const check = document.createElement('span');
        check.className = 'prism-prism-check';
        check.setAttribute('aria-hidden', 'true');
        check.textContent = '✓';
        button.append(check, document.createTextNode('保存しました'));
        status.textContent = '保存が完了しました';
        shimmer(button);
        timers.push(setTimeout(() => {
          button.classList.remove('prism-save-complete', 'prism-shimmer');
          button.classList.add('prism-save-done');
          button.removeAttribute('aria-disabled');
          status.textContent = '完了・もう一度押すと再生';
        }, SAVE_DONE_MS));
      }, SAVE_PENDING_MS));
    });
  }

  function initThemeButtons() {
    const buttons = root.querySelectorAll('[data-theme-choice]');
    buttons.forEach(button => button.addEventListener('click', () => {
      root.dataset.theme = button.dataset.themeChoice;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
  }

  function initActionButtons() {
    root.querySelectorAll('.prism-button[data-action]').forEach(button => {
      button.addEventListener('click', () => {
        feedback.textContent = button.dataset.action + '：操作を受け付けました';
        accept(button);
      });
    });
  }

  function initToggleButtons() {
    root.querySelectorAll('.prism-button[aria-pressed]').forEach(button => {
      button.addEventListener('click', () => {
        const selected = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(selected));
        if (selected) shimmer(button);
        else {
          button.classList.remove('prism-shimmer');
          pulseIcons(button);
        }
        const name = button.id === 'prism-like' || button.classList.contains('prism-button-icon')
          ? 'お気に入り' : '選択';
        feedback.textContent = name + '：' + (selected ? 'オン' : 'オフ');
      });
    });
  }

  function initTabs() {
    const tablist = root.querySelector('.prism-tabs');
    const tabs = Array.from(tablist.querySelectorAll('.prism-tab'));
    const indicator = tablist.querySelector('.prism-indicator');
    const panel = root.querySelector('#prism-panel');

    function move() {
      const selected = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
      indicator.style.width = (selected.offsetWidth - 20) + 'px';
      indicator.style.transform = 'translateX(' + (selected.offsetLeft + 10) + 'px)';
    }

    function selectTab(tab) {
      tabs.forEach(item => {
        item.setAttribute('aria-selected', String(item === tab));
        item.tabIndex = item === tab ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      panel.textContent = tab.id === 'prism-all' ? 'すべての見本' : tab.textContent + 'の見本';
      move();
      shimmer(indicator);
    }

    tabs.forEach(tab => tab.addEventListener('click', () => selectTab(tab)));
    tablist.addEventListener('keydown', event => {
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      selectTab(tabs[next]);
    });
    move();
    new ResizeObserver(move).observe(tablist);
  }

  function initSwitch() {
    root.querySelector('#prism-notice').addEventListener('change', event => {
      if (event.target.checked) shimmer(event.target);
      else event.target.classList.remove('prism-shimmer');
      feedback.textContent = 'お知らせ：' + (event.target.checked ? 'オン' : 'オフ');
    });
  }

  initPrismWord();
  initSaveDemo();
  initThemeButtons();
  initActionButtons();
  initToggleButtons();
  initTabs();
  initSwitch();
})();
