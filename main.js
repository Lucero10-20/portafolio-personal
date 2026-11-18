(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  // Menú móvil
  const btn = $('#menuBtn'), nav = $('#nav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); btn.setAttribute('aria-expanded', false);
  }));

  // Texto que cambia en el título
  const typed = $('#typed');
  const words = JSON.parse(typed.dataset.words);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let w = 0, i = words[0].length, del = true;
    (function tick() {
      typed.textContent = words[w].slice(0, i);
      if (del) { i--; if (i < 0) { del = false; w = (w + 1) % words.length; i = 0; } }
      else { i++; if (i > words[w].length) { del = true; i = words[w].length; setTimeout(tick, 1400); return; } }
      setTimeout(tick, del ? 45 : 90);
    })();
  }

  // Enlace activo al hacer scroll
  const links = $$('#nav a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section').forEach(s => io.observe(s));

  // Barras de habilidades
  const bars = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { $$('i', e.target).forEach(i => i.style.width = i.dataset.w + '%'); o.unobserve(e.target); }
  }), { threshold: .3 });
  $$('.skills').forEach(s => bars.observe(s));

  // Formulario de contacto
  const form = $('#form'), status = $('#status'), send = $('#send');
  const show = (msg, ok) => { status.textContent = msg; status.className = ok ? 'ok' : 'err'; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    $$('input[required],textarea[required]', form).forEach(f => {
      const bad = !f.checkValidity(); f.classList.toggle('bad', bad); if (bad) valid = false;
    });
    if (!valid) return show('Revisa los campos marcados en rojo.', false);
    send.disabled = true; show('Enviando…', true);
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const t = await r.text();
      let d;
      try { d = JSON.parse(t); } catch (_) { console.log('Respuesta del servidor:', t); return show('El servidor no respondió como se esperaba (código ' + r.status + ').', false); }
      if (d.ok) { show('¡Mensaje enviado! Te responderé pronto.', true); form.reset(); }
      else show(d.error || 'No se pudo enviar. Inténtalo de nuevo.', false);
    } catch (_) { show('No se pudo conectar con el servidor.', false); }
    send.disabled = false;
  });
})();
