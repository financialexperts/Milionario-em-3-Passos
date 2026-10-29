// A folha só abre quando alguém entra (session.js): cada conta tem a sua
// folha, guardada no banco e neste navegador.
window.Session.ready(function (user) {
  "use strict";

  var Sheet = window.Sheet;
  var View = window.SheetView;
  var Sync = window.Sync;

  Sheet.open(user.id);

  function el(id) { return document.getElementById(id); }

  // o tema, o vidro e os ícones animados ficam no ui.js
  var semAnimacao = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============ a folha ============ */
  View.mount(el("p-etapas"), el("p-total"), window.Session.fullName);

  // a folha do banco, quando é mais nova que a deste navegador, entra no
  // lugar e a tela se redesenha
  Sync.start(user.id, window.Session.fullName, View.render, View.setStatus);

  /* ============ medidores grudados no alto ============ */
  // Grudados, os medidores viram uma cápsula de vidro (a mesma da Teoria das
  // caixas).
  var meters = el("meters");
  var quadroPedido = false;
  function syncStuck() {
    meters.classList.toggle("is-stuck",
      meters.getBoundingClientRect().top <= parseFloat(getComputedStyle(meters).top) + 0.5);
  }
  function aoRolar() {
    if (quadroPedido) return;
    quadroPedido = true;
    requestAnimationFrame(function () {
      quadroPedido = false;
      syncStuck();
    });
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRolar);
  syncStuck();

  /* ============ apagar ============ */
  // (Imprimir pelo menu do navegador sai a folha do jeito da original: o
  // sheet-view.js monta ela no beforeprint.)
  //
  // Apagar a folha tira tudo o que o aluno escreveu (aqui e no banco): se já
  // tem alguma coisa, pergunta antes.
  el("btn-clear").addEventListener("click", function () {
    if (Sheet.started() && !window.confirm("Apagar tudo o que você escreveu na folha e começar de novo?")) return;
    Sheet.reset();
    View.render();
    window.scrollTo({ top: 0, behavior: semAnimacao ? "auto" : "smooth" });
  });
});
