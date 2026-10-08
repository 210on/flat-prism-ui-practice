/* Flat Prism UI Practice v1.0. No dependencies. Business logic remains with the site. */
(function (global) {
  'use strict';
  const instances = new WeakMap();
  const timers = new WeakMap();
  const reduced = () => global.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function pulseIcons(element) {
    if (reduced()) return;
    element.querySelectorAll('[data-prism-icon],svg').forEach(icon => {
      icon.classList.remove('prism-icon-pulse'); void icon.getBoundingClientRect();
      icon.classList.add('prism-icon-pulse');
    });
  }
  function shimmer(element) {
    pulseIcons(element);
    if (reduced()) return;
    element.classList.remove('prism-shimmer'); void element.offsetWidth;
    element.classList.add('prism-shimmer');
  }
  function accept(element) {
    if (element.disabled || element.getAttribute('aria-disabled') === 'true') return;
    clearTimeout(timers.get(element));
    element.classList.add('prism-flash'); shimmer(element);
    timers.set(element, setTimeout(() => element.classList.remove('prism-flash'), 1300));
  }
  function setTheme(root, theme) {
    if (!['light', 'dark'].includes(theme)) throw new TypeError('theme must be light or dark');
    root.dataset.theme = theme;
    root.querySelectorAll('[data-prism-theme]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.prismTheme === theme));
    });
  }
  function init(root) {
    if (!root || !root.classList.contains('prism-ui')) throw new TypeError('Pass a .prism-ui element');
    if (instances.has(root)) return instances.get(root);
    const abort = new AbortController(); const cleanups = []; const observedWords = [];
    root.addEventListener('click', event => {
      const button = event.target.closest('button,a.prism-button');
      if (!button || !root.contains(button)) return;
      if (button.disabled || button.getAttribute('aria-disabled') === 'true') {
        event.preventDefault(); event.stopImmediatePropagation(); return;
      }
      if (button.hasAttribute('data-prism-theme')) { setTheme(root, button.dataset.prismTheme); return; }
      if (button.matches('[data-prism-toggle]')) {
        const selected = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(selected));
        if (selected) shimmer(button); else {button.classList.remove('prism-shimmer'); pulseIcons(button);}
        button.dispatchEvent(new CustomEvent('prism:change', {bubbles:true, detail:{selected}}));
      } else if (button.hasAttribute('data-prism-action')) accept(button);
      if (button.classList.contains('prism-word')) {
        if (reduced()) return;
        button.classList.remove('prism-word-play','prism-word-replay'); void button.offsetWidth;
        button.classList.add('prism-word-play','prism-word-replay');
      }
    }, {signal:abort.signal});
    root.addEventListener('change', event => {
      if (event.target.matches('.prism-switch') && event.target.checked) shimmer(event.target);
    }, {signal:abort.signal});
    root.querySelectorAll('.prism-tabs[role="tablist"]').forEach(tablist => {
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;
      let indicator = tablist.querySelector('.prism-indicator');
      if (!indicator) {indicator=document.createElement('span');indicator.className='prism-indicator';indicator.setAttribute('aria-hidden','true');tablist.append(indicator);}
      function position() {
        const selected=tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
        if (!selected) return;
        const pad=parseFloat(getComputedStyle(selected).paddingLeft) || 0;
        indicator.style.width=Math.max(0,selected.offsetWidth-pad*2)+'px';
        indicator.style.transform='translateX('+(selected.offsetLeft+pad)+'px)';
      }
      function select(tab, animate) {
        tabs.forEach(item => {
          const active=item===tab; item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;
          const panel=document.getElementById(item.getAttribute('aria-controls'));
          if (panel && root.contains(panel)) panel.hidden=!active;
        });
        position(); if (animate) shimmer(indicator);
        tablist.dispatchEvent(new CustomEvent('prism:tabchange',{bubbles:true,detail:{tabId:tab.id}}));
      }
      select(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0],false);
      tabs.forEach(tab=>tab.addEventListener('click',()=>select(tab,true),{signal:abort.signal}));
      tablist.addEventListener('keydown',event=>{
        const index=tabs.indexOf(document.activeElement);if(index<0)return;
        let next;
        if(event.key==='ArrowRight')next=(index+1)%tabs.length;
        else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
        else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
        event.preventDefault();tabs[next].focus();select(tabs[next],true);
      },{signal:abort.signal});
      const resize=new ResizeObserver(position);resize.observe(tablist);cleanups.push(()=>resize.disconnect());
    });
    root.querySelectorAll('.prism-word').forEach(word=>observedWords.push(word));
    if ('IntersectionObserver' in global && !reduced()) {
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('prism-word-play');observer.unobserve(entry.target);}
      }),{threshold:.3});observedWords.forEach(word=>observer.observe(word));cleanups.push(()=>observer.disconnect());
    }
    const api={destroy(){abort.abort();cleanups.forEach(fn=>fn());root.querySelectorAll('.prism-button').forEach(button=>{clearTimeout(timers.get(button));button.classList.remove('prism-flash');});instances.delete(root);}};
    instances.set(root,api);return api;
  }
  /* Await the site's real operation. A resolved promise means success; failures must reject.
     statusElement should be a dedicated aria-live region outside the button. */
  async function run(button, operation, options={}) {
    if(button.disabled || button.getAttribute('aria-disabled')==='true')return;
    if(typeof operation!=='function')throw new TypeError('operation must be an async function');
    const status=options.statusElement;
    const idleLabel=options.idleLabel || button.textContent.trim();
    clearTimeout(timers.get(button));button.classList.remove('prism-flash','prism-shimmer','prism-save-complete','prism-save-done');
    button.setAttribute('aria-busy','true');button.setAttribute('aria-disabled','true');
    button.replaceChildren();const spinner=document.createElement('span');spinner.className='prism-spinner';spinner.setAttribute('aria-hidden','true');button.append(spinner,document.createTextNode(options.pendingLabel || '保存中…'));
    if(status){status.classList.remove('prism-error');status.textContent=options.pendingLabel || '保存中';}
    try {
      const result=await operation();
      button.setAttribute('aria-busy','false');button.replaceChildren();
      const check=document.createElement('span');check.className='prism-prism-check';check.setAttribute('aria-hidden','true');check.textContent='✓';
      button.append(check,document.createTextNode(options.successLabel || '保存しました'));
      button.classList.add('prism-save-complete');shimmer(button);
      if(status)status.textContent=options.successLabel || '保存が完了しました';
      timers.set(button,setTimeout(()=>{
        button.classList.remove('prism-save-complete','prism-shimmer');button.classList.add('prism-save-done');button.removeAttribute('aria-disabled');
      }, options.completionDuration ?? 1400));
      return result;
    } catch(error) {
      button.setAttribute('aria-busy','false');button.removeAttribute('aria-disabled');button.textContent=options.retryLabel || idleLabel;
      if(status){status.textContent=options.errorLabel || '保存できませんでした。もう一度お試しください。';status.classList.add('prism-error');}
      throw error;
    } finally { if(button.getAttribute('aria-busy')==='false' && button.classList.contains('prism-save-complete')) status?.classList.remove('prism-error'); }
  }
  global.PrismUI=Object.freeze({init,setTheme,accept,shimmer,run});
})(window);
