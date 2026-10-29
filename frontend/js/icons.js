(function (global) {
  "use strict";

  // Os ícones da tela, todos de traço numa grade de 24×24 (os mesmos da
  // Teoria das caixas, mais os das 3 etapas). A cor vem do texto em volta
  // (currentColor). As peças com classe (ico-coin, ico-lid…) são as que se
  // mexem na animação de cada ícone (styles.css, "Ícones animados").
  // pathLength="1" deixa o traço "se desenhar" sem precisar medir o caminho.
  var PATHS = {
    // as 3 etapas, como os desenhos da folha
    // 1. trocando uma marca: um copo vira o outro
    troca: '<g class="ico-cup"><rect x="2.6" y="3.6" width="8.4" height="2.2" rx=".7"/><path d="M3.5 5.8l.9 7.7h4.8l.9-7.7"/><path d="M3.9 9h5.8"/></g>' +
      '<g class="ico-cup ico-cup--2"><rect x="13" y="10.5" width="8.4" height="2.2" rx=".7"/><path d="M13.9 12.7l.9 7.7h4.8l.9-7.7"/><path d="M14.3 15.9h5.8"/></g>' +
      '<g class="ico-arrows"><path d="M13.2 4.7h3.6a2.4 2.4 0 0 1 2.4 2.4V9"/><path d="M17.6 7.4l1.6 1.6 1.6-1.6"/><path d="M10.8 19.6H7.2a2.4 2.4 0 0 1-2.4-2.4V15"/><path d="M3.2 16.6l1.6-1.6 1.6 1.6"/></g>',
    // 2. diminuindo um hábito: o lanche
    hamburguer: '<g class="ico-bun"><path d="M4 11c0-3.9 3.6-6.6 8-6.6s8 2.7 8 6.6z"/><path class="ico-pips" d="M9 8.3h.01M12 7.3h.01M15 8.3h.01"/></g>' +
      '<path d="M3.6 13.4q1.2-1.6 2.4 0t2.4 0 2.4 0 2.4 0 2.4 0 2.4 0 2.4 0"/>' +
      '<rect x="3.5" y="15.1" width="17" height="2.6" rx="1.3"/>' +
      '<path d="M4.5 19.1h15v.5a1.6 1.6 0 0 1-1.6 1.6H6.1a1.6 1.6 0 0 1-1.6-1.6z"/>',
    // 3. diminuindo um gasto recorrente: a conta que vem todo mês
    assinatura: '<path d="M10.8 16.5H4.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3.3"/><path d="M2.5 9h13M6.2 2.8v3.4M11.8 2.8v3.4"/>' +
      '<path class="ico-pips" d="M5.8 12.2h.01M9 12.2h.01M5.8 14.6h.01M9 14.6h.01"/>' +
      '<g class="ico-bag"><path d="M12.6 13.2h8.8l-.9 8.3h-7z"/><path d="M15 13.2v-1a2 2 0 0 1 4 0v1"/>' +
      '<path class="ico-thin" d="M17 15.2v.6M17 19.4v.6M18.2 16.2c-.3-.4-.7-.5-1.2-.5-.6 0-1.1.3-1.1.8 0 1.1 2.4.6 2.4 1.7 0 .5-.5.8-1.2.8-.6 0-1-.2-1.3-.6"/></g>',

    // a folha e os resultados
    lista: '<path d="M9 6h11M9 12h11M9 18h11"/><path class="ico-pips" d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/><path class="ico-pips" d="M8 13.6h.01M12 13.6h.01M16 13.6h.01M8 17.2h.01M12 17.2h.01"/>',
    cofrinho: '<ellipse cx="11.5" cy="13" rx="7.5" ry="5.5"/><path d="M7.8 17.8v2.7M15.2 17.8v2.7"/><path d="M19 11.2h1.3a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1H19"/><path d="M12.6 7.7l1.6-2.4 1.2 2.9"/><path d="M15.6 11h.01"/><path d="M4 12.5c-1.2 0-1.8-.8-1.6-1.8"/><path d="M9.8 8.6h3.2"/><circle class="ico-coin" cx="11.4" cy="3.4" r="1.5"/>',
    moedas: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    calculadora: '<rect x="5" y="2.5" width="14" height="19" rx="2.2"/><rect x="8" y="5.5" width="8" height="3.8" rx=".8"/><path class="ico-keys" d="M8.8 13h.01M12 13h.01M15.2 13h.01M8.8 16.6h.01M12 16.6h.01M15.2 16.6h.01"/>',
    trofeu: '<path d="M7.5 3.5h9V9a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H5.2a2.6 2.6 0 0 0 2.9 3.8M16.5 5.5h2.3a2.6 2.6 0 0 1-2.9 3.8"/><path d="M12 13.5V17M8.5 20.5h7M9.8 17h4.4l.6 3.5H9.2z"/>',

    // o salvar, os medidores e os botões
    relogio: '<circle cx="12" cy="12" r="9"/><path class="ico-hands" d="M12 7v5l3 2"/>',
    conferir: '<circle cx="12" cy="12" r="9"/><path class="ico-line" pathLength="1" d="M7.8 12.4l2.9 2.9 5.5-6"/>',
    alerta: '<path d="M12 3.5 21.5 20h-19z"/><path class="ico-mark" d="M12 9.8v4.6M12 17.1h.01"/>',
    lixeira: '<path d="M4 6.5h16"/><path class="ico-lid" d="M9.5 6.5V4h5v2.5"/><path d="M6 6.5l1 14h10l1-14"/><path d="M10 10.5v6M14 10.5v6"/>',
    imprimir: '<path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8.5" rx="2"/><path class="ico-paper" d="M7 13.5h10v7H7z"/>'
  };

  function svg(name) {
    return '<svg class="ico ico--' + name + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (PATHS[name] || "") + "</svg>";
  }

  // o ícone dentro de um quadrinho colorido; tone = a cor (green, violet,
  // amber…); extra = classes a mais (tamanho…)
  function tile(name, tone, extra) {
    return '<span class="itile itile--' + (tone || "neutral") + (extra ? " " + extra : "") + '" aria-hidden="true">' +
      svg(name) + "</span>";
  }

  // Os ícones fixos da página são marcados com data-icon="nome" e
  // desenhados aqui, pra os desenhos ficarem num lugar só.
  function mount(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll("[data-icon]"), function (el) {
      el.innerHTML = svg(el.getAttribute("data-icon"));
      el.setAttribute("aria-hidden", "true");
    });
  }

  global.Icons = {
    svg: svg,
    tile: tile,
    mount: mount
  };
})(window);
