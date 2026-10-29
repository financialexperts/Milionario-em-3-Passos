(function (global) {
  "use strict";

  var Etapas = global.Etapas;

  // O estado da folha "Se torne um milionário em 3 passos": o que o aluno
  // escreveu em cada campo. Não toca no DOM e não faz conta nenhuma: só
  // guarda o que o aluno escreve (o valor até os 65 anos sai disso, no
  // juros.js, e não fica guardado). Aqui ficam também o que já foi
  // preenchido (pras marcas de preenchido e os medidores) e o guardar no
  // navegador; o guardar no banco é o sync.js.
  //
  // data:    { id do campo (etapas.js): o texto, do jeito que o aluno
  //          escreveu }. Campo vazio não fica guardado.
  // savedAt: quando a folha mudou pela última vez (ISO), pra saber qual é a
  //          mais nova: a deste navegador ou a do banco (sync.js).
  var data = {};
  var savedAt = null;
  var touched = false;   // o aluno já mexeu na folha desde que ela abriu
  var listeners = [];

  // Tudo fica guardado no navegador, separado por conta
  // ("milionario-3-passos:" e o id de quem entrou). O open() escolhe a conta.
  var BASE = "milionario-3-passos";
  var KEY = BASE;

  function get(id) { return data[id] || ""; }
  function filled(id) { return get(id).trim() !== ""; }

  // o que serve de um texto guardado: só os campos que existem, e no tamanho
  // de cada um
  function clean(src) {
    var out = {};
    if (!src || typeof src !== "object") return out;
    Etapas.allIds().forEach(function (id) {
      var v = src[id];
      if (typeof v !== "string" && typeof v !== "number") return;
      v = String(v).slice(0, Etapas.field(id).max);
      if (v.trim()) out[id] = v;
    });
    return out;
  }

  function changed() {
    savedAt = new Date().toISOString();
    save();
    listeners.forEach(function (fn) { fn(); });
  }

  /* ============ mudanças ============ */
  // muda um campo (o texto do jeito que o aluno escreveu)
  function set(id, value) {
    var f = Etapas.field(id);
    if (!f) return;
    var v = String(value == null ? "" : value).slice(0, f.max);
    if (v === get(id)) return;
    if (v.trim()) data[id] = v;
    else delete data[id];
    touched = true;
    changed();
  }

  function reset() {
    data = {};
    touched = true;
    changed();
  }

  // a folha que veio do banco, mais nova que a deste navegador (sync.js)
  function replace(src, when) {
    data = clean(src);
    savedAt = when || null;
    save();
  }

  // avisa (o sync.js) a cada mudança
  function onChange(fn) { listeners.push(fn); }

  /* ============ o que já foi preenchido ============ */
  function progressOf(key) {
    var ids = Etapas.idsOf(key);
    var n = ids.filter(filled).length;
    return { filled: n, total: ids.length, done: n === ids.length };
  }

  function progress() {
    var ids = Etapas.allIds();
    return {
      filled: ids.filter(filled).length,
      total: ids.length,
      done: Etapas.list.filter(function (e) { return progressOf(e.key).done; }).length
    };
  }

  // já tem alguma coisa escrita? (pra perguntar antes de apagar tudo)
  function started() { return Etapas.allIds().some(filled); }

  /* ============ guardar no navegador ============ */
  // Pode não ter como guardar (janela anônima, navegador que bloqueia): aí a
  // folha funciona igual, só não lembra depois de recarregar (a não ser que
  // ela esteja no banco).
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ data: data, savedAt: savedAt }));
    } catch (err) {}
  }

  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (err) { saved = null; }
    if (!saved || typeof saved !== "object") return;
    data = clean(saved.data);
    savedAt = typeof saved.savedAt === "string" && !isNaN(Date.parse(saved.savedAt)) ? saved.savedAt : null;
  }

  function open(userId) {
    KEY = BASE + ":" + userId;
    data = {};
    savedAt = null;
    touched = false;
    load();
  }

  global.Sheet = {
    open: open,
    get: get,
    filled: filled,
    set: set,
    reset: reset,
    replace: replace,
    onChange: onChange,
    progressOf: progressOf,
    progress: progress,
    started: started,
    touched: function () { return touched; },
    snapshot: function () { return { data: data, savedAt: savedAt }; }
  };
})(window);
