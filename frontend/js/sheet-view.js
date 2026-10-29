(function (global) {
  "use strict";

  var Etapas = global.Etapas;
  var Sheet = global.Sheet;
  var Format = global.Format;
  var Parse = global.Parse;
  var Mask = global.Mask;
  var Icons = global.Icons;

  // A folha "Se torne um milionário em 3 passos" na tela: as 3 etapas, cada
  // uma com os campos da folha, e o valor total economizado no fim. A folha
  // não faz conta nenhuma: cada campo só ganha a marca de preenchido, e os
  // medidores do alto contam as etapas completas e os campos preenchidos.
  //
  // Os campos são montados uma vez (e de novo só quando a folha inteira
  // muda: apagar, ou a versão do banco entrando); o resto só é atualizado,
  // pra não tirar o foco de quem está digitando.

  var root = null;      // o container das 3 etapas
  var totalBox = null;  // o container do valor total
  var getName = null;   // o nome de quem entrou (vai na folha impressa)

  function el(id) { return document.getElementById(id); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ============ montagem ============ */
  // Um campo da folha: o rótulo em cima e a caixa embaixo, com o "R$" antes
  // (dinheiro), a unidade depois ("vezes") e a marca de preenchido no fim.
  function fieldHTML(f, bare) {
    var id = "f-" + f.id;
    var input = '<input class="fbox__input" id="' + id + '" data-f="' + f.id + '" type="text" maxlength="' + f.max + '" ' +
      'autocomplete="off" ' +
      (f.type === "text"
        ? 'placeholder="' + Format.esc(f.placeholder || "") + '"'
        : 'inputmode="' + (f.type === "money" ? "decimal" : "numeric") + '" autocorrect="off" spellcheck="false" placeholder="' + (f.type === "money" ? "0,00" : "0") + '"') +
      ' value="' + Format.esc(Sheet.get(f.id)) + '">';
    return '<div class="ffield ffield--' + f.type + (f.result ? " ffield--result" : "") + '" data-field="' + f.id + '">' +
      (bare ? "" : '<label class="ffield__label" for="' + id + '">' +
        (f.icon ? Icons.svg(f.icon) : "") +
        "<span>" + Format.esc(f.label) +
          (f.hint ? ' <span class="ffield__hint">' + Format.esc(f.hint) + "</span>" : "") +
          (f.sr ? '<span class="sr-only"> ' + Format.esc(f.sr) + "</span>" : "") +
        "</span></label>") +
      '<div class="fbox">' +
        (f.type === "money" ? '<span class="fbox__pre" aria-hidden="true">R$</span>' : "") +
        input +
        (f.unit ? '<span class="fbox__suf" aria-hidden="true">' + Format.esc(f.unit) + "</span>" : "") +
        '<span class="fbox__mark" aria-hidden="true"></span>' +
      "</div>" +
      "</div>";
  }

  // Uma linha da folha. Nos produtos, a seta fica entre o preço atual e o
  // novo; nos resultados, o aviso de que a conta é feita no outro sistema.
  function rowHTML(row) {
    return '<div class="frow frow--' + row.kind + (row.kind === "linha" ? " frow--" + row.fields.length : "") + '">' +
      (row.kind === "resultado"
        ? '<p class="frow__kicker">' + Icons.svg("calculadora") + "Faça a conta no sistema de cálculo e escreva o resultado</p>"
        : "") +
      row.fields.map(function (f) {
        return (f.arrow ? '<span class="farrow" aria-hidden="true">→</span>' : "") + fieldHTML(f);
      }).join("") +
      "</div>";
  }

  function etapaHTML(e) {
    var p = "et-" + e.key;
    return '<section class="card etapa etapa--' + e.num + '" id="etapa-' + e.key + '" data-etapa="' + e.key + '" aria-labelledby="' + p + '-kicker ' + p + '-title">' +
      '<div class="etapa__side fx">' +
        '<p class="etapa__kicker" id="' + p + '-kicker">Etapa ' + e.num + "</p>" +
        '<p class="etapa__num" aria-hidden="true">' + pad(e.num) + "</p>" +
        '<span class="etapa__art">' + Icons.svg(e.icon) + "</span>" +
      "</div>" +
      '<div class="etapa__main">' +
        '<div class="etapa__head">' +
          "<div>" +
            '<h3 class="etapa__title" id="' + p + '-title">' + Format.esc(e.title) + "</h3>" +
            '<p class="etapa__lead">' + Format.esc(e.lead) + "</p>" +
          "</div>" +
          '<p class="etapa__count" data-count></p>' +
        "</div>" +
        '<div class="frows">' + e.rows.map(rowHTML).join("") + "</div>" +
      "</div>" +
      "</section>";
  }

  function totalHTML() {
    var f = Etapas.total;
    return '<label class="ptotal__bar" for="f-' + f.id + '">' + Icons.svg("trofeu") + Format.esc(f.label) + "</label>" +
      '<div class="ptotal__body">' +
        fieldHTML(f, true) +
        '<p class="ptotal__sub">Escreva aqui o total que você calculou no sistema de cálculo da Financial Experts.</p>' +
      "</div>";
  }

  // a legenda da abertura: as 3 etapas, cada uma levando até o cartão dela
  function keysHTML() {
    return Etapas.list.map(function (e) {
      return '<li><a class="ekey ekey--' + e.num + ' fx" href="#etapa-' + e.key + '" data-key="' + e.key + '">' +
        '<span class="ekey__tile">' + Icons.svg(e.icon) + "</span>" +
        '<span class="ekey__text"><span class="ekey__num">Etapa ' + e.num + "</span>" +
        '<span class="ekey__name">' + Format.esc(e.title) + "</span></span>" +
        "</a></li>";
    }).join("");
  }

  /* ============ a tela acompanha o estado ============ */
  function syncField(id) {
    var box = document.querySelector('[data-field="' + id + '"]');
    if (box) box.classList.toggle("is-filled", Sheet.filled(id));
  }

  function syncEtapa(e) {
    var card = root.querySelector('[data-etapa="' + e.key + '"]');
    var p = Sheet.progressOf(e.key);
    card.classList.toggle("is-done", p.done);
    card.querySelector("[data-count]").innerHTML = p.done
      ? "Etapa completa"
      : '<span class="nw">' + p.filled + " de " + p.total + "</span> campos";
    var key = el("p-keys").querySelector('[data-key="' + e.key + '"]');
    if (key) key.classList.toggle("is-done", p.done);
  }

  // Os medidores do alto: quantas etapas estão completas e quantos campos já
  // foram preenchidos (contar o que foi escrito: conta de dinheiro nenhuma).
  function syncMeters() {
    var p = Sheet.progress();
    el("meter-etapas-used").textContent = String(p.done);
    el("meter-etapas-fill").style.width = (p.done / Etapas.list.length * 100) + "%";
    el("meter-campos-used").textContent = String(p.filled);
    el("meter-campos-fill").style.width = (p.filled / p.total * 100) + "%";
  }

  function sync() {
    Etapas.allIds().forEach(syncField);
    Etapas.list.forEach(syncEtapa);
    syncMeters();
  }

  /* ============ guardado ============ */
  // O aviso do alto da folha: onde ela está guardada. reason (só quando ela
  // está só no navegador) vai no title, pra o professor descobrir o motivo.
  var STATUS = {
    loading: { icon: "relogio", text: "Abrindo a sua folha…" },
    saving: { icon: "relogio", text: "Salvando…" },
    cloud: { icon: "conferir", text: "Salvo na sua conta" },
    local: { icon: "alerta", text: "Salvo só neste navegador" }
  };

  function setStatus(state, reason) {
    var s = STATUS[state];
    var box = el("p-save");
    if (!s || !box) return;
    box.title = reason || "";
    if (box.getAttribute("data-state") === state) return;
    box.setAttribute("data-state", state);
    box.innerHTML = Icons.svg(s.icon) + "<span>" + s.text + "</span>";
  }

  /* ============ a folha impressa ============ */
  // A folha "Se torne um milionário em 3 passos", do jeito da original,
  // preenchida com o que o aluno escreveu. Só aparece na impressão
  // (passos.css).
  function shown(f) {
    var v = Sheet.get(f.id).trim();
    if (!v) return "";
    if (f.type === "money") return "R$ " + v;
    if (f.unit) return v + " " + f.unit;
    return v;
  }

  function sheetField(f) {
    return (f.arrow ? '<span class="psheet__arrow">→</span>' : "") +
      '<div class="psheet__field' + (f.result ? " psheet__field--result" : "") + '">' +
        '<p class="psheet__label">' + Format.esc(f.label) + (f.hint ? " <span>" + Format.esc(f.hint) + "</span>" : "") + ":</p>" +
        '<p class="psheet__fill">' + Format.esc(shown(f)) + "</p>" +
      "</div>";
  }

  function sheetHTML() {
    var name = getName ? getName() : "";
    return '<h1 class="psheet__title">Se torne um milionário<br>em 3 passos</h1>' +
      '<p class="psheet__who">' + (name ? "<strong>" + Format.esc(name) + "</strong> · " : "") +
        "Feito em " + Format.esc(Format.monthYear(Format.thisMonth())) + "</p>" +
      Etapas.list.map(function (e) {
        return '<section class="psheet__etapa">' +
          '<div class="psheet__side">' +
            '<p class="psheet__kicker">Etapa ' + e.num + ":</p>" +
            '<p class="psheet__num">' + pad(e.num) + "</p>" +
            Icons.svg(e.icon) +
          "</div>" +
          '<div class="psheet__main">' +
            '<p class="psheet__name">' + Format.esc(e.title) + "</p>" +
            e.rows.map(function (row) {
              return '<div class="psheet__row psheet__row--' + row.kind + (row.kind === "linha" ? " psheet__row--" + row.fields.length : "") + '">' +
                row.fields.map(sheetField).join("") + "</div>";
            }).join("") +
          "</div>" +
          "</section>";
      }).join("") +
      '<p class="psheet__bar">' + Format.esc(Etapas.total.label) + "</p>" +
      '<p class="psheet__total">' + Format.esc(shown(Etapas.total) || "R$") + "</p>";
  }

  function buildSheet() {
    el("psheet").innerHTML = sheetHTML();
  }

  /* ============ eventos ============ */
  // A máscara das células de dinheiro (mask.js): só algarismos, o ponto e a
  // vírgula; os pontos de milhar entram sozinhos e o cursor fica no mesmo
  // lugar dos algarismos.
  function soNumero(s) {
    return s.replace(/[^\d.,]/g, "").replace(/,/g, function (c, i, all) {
      return all.indexOf(",") === i ? c : "";
    });
  }

  function mascarar(input, inputType) {
    var raw = input.value;
    var end = input.selectionEnd == null ? raw.length : input.selectionEnd;
    var limpo = soNumero(raw);
    var masked = Mask.live(limpo, /^delete/.test(inputType));
    if (masked === null) masked = limpo;
    if (masked === raw) return;
    var after = Mask.significant(soNumero(raw.slice(end)));
    input.value = masked;
    var p = Mask.caret(masked, after, /Backward$/.test(inputType));
    input.setSelectionRange(p, p);
  }

  // as células de quantas vezes: só algarismos
  function contar(input) {
    var v = input.value.replace(/\D/g, "");
    if (v !== input.value) input.value = v;
  }

  // ao sair da célula de dinheiro, o número se completa: "1.200" vira
  // "1.200,00"
  function completar(input) {
    var n = Parse.money(input.value);
    if (n === null) return;
    input.value = Format.plain(n);
  }

  function handleInput(e) {
    var t = e.target;
    var id = t.getAttribute && t.getAttribute("data-f");
    var f = id && Etapas.field(id);
    if (!f) return;
    if (f.type === "money" && !e.isComposing) mascarar(t, e.inputType || "");
    if (f.type === "count") contar(t);
    Sheet.set(id, t.value);
    syncField(id);
    if (f.etapa) syncEtapa(Etapas.byKey(f.etapa));
    syncMeters();
  }

  function handleBlur(e) {
    var t = e.target;
    var id = t.getAttribute && t.getAttribute("data-f");
    var f = id && Etapas.field(id);
    if (!f || f.type !== "money") return;
    completar(t);
    Sheet.set(id, t.value);
  }

  // a legenda leva até a etapa e põe o cursor no primeiro campo dela
  function irParaEtapa(e) {
    var a = e.target.closest("[data-key]");
    if (!a) return;
    e.preventDefault();
    var card = el("etapa-" + a.getAttribute("data-key"));
    var semAnimacao = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: semAnimacao ? "auto" : "smooth", block: "start" });
    var first = card.querySelector("[data-f]");
    if (first) first.focus({ preventScroll: true });
  }

  /* ============ API ============ */
  function render() {
    root.innerHTML = Etapas.list.map(etapaHTML).join("");
    totalBox.innerHTML = totalHTML();
    Icons.mount(root);
    Icons.mount(totalBox);
    sync();
  }

  function mount(container, total, nameFn) {
    root = container;
    totalBox = total;
    getName = nameFn || null;
    el("p-keys").innerHTML = keysHTML();
    el("p-keys").addEventListener("click", irParaEtapa);
    el("meter-etapas-max").textContent = String(Etapas.list.length);
    el("meter-campos-max").textContent = String(Etapas.allIds().length);
    render();
    [root, totalBox].forEach(function (box) {
      box.addEventListener("input", handleInput);
      box.addEventListener("focusout", handleBlur);
    });
    global.addEventListener("beforeprint", buildSheet);
  }

  global.SheetView = {
    mount: mount,
    render: render,
    setStatus: setStatus,
    buildSheet: buildSheet
  };
})(window);
