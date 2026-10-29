(function (global) {
  "use strict";

  var Sheet = global.Sheet;

  // Guarda a folha do aluno no Supabase do login (o mesmo do Fluxo de Caixa
  // e da Teoria das caixas), na tabela worksheets: uma linha por aluno e por
  // folha, como a game_scores dos jogos. A coluna sheet separa as folhas:
  // aqui é "milionario-3-passos". A tabela já está criada no Supabase (o
  // README diz como ela é).
  //
  // A folha também fica no navegador (sheet.js): ela abre na hora, sem
  // esperar o banco. Ao abrir, vale a mais nova das duas; a cada mudança, a
  // folha vai pro banco um instante depois que o aluno para de digitar. Sem
  // a tabela (ou sem internet), tudo funciona igual e o aviso no alto da
  // folha diz que ela está guardada só neste navegador.

  var SHEET = "milionario-3-passos";
  var TABLE = "worksheets";
  var WAIT = 1200;       // quanto esperar depois da última tecla pra mandar

  var ctx = null;        // { userId, name (o nome do login) }
  var timer = null;
  var sending = false;
  var again = false;     // mudou enquanto mandava: manda de novo no fim
  var missing = false;   // o banco não tem a tabela: não adianta tentar de novo
  var status = function () {};

  function db() { return global.DB && global.DB.client; }

  // o resultado de uma chamada ao banco, ou o erro de rede, no mesmo formato
  function orNetworkError(p) {
    return p.then(function (res) { return res; }, function (err) {
      return { error: err || { message: "network" } };
    });
  }

  // o motivo de a folha estar só no navegador, do jeito que o professor e o
  // aluno entendem (vai no title do aviso)
  function errorText(err) {
    var msg = (err && (err.message || err.code)) || "";
    if (/relation .* does not exist|42P01|could not find the table|schema cache/i.test(msg)) {
      return "A tabela worksheets não foi encontrada no Supabase.";
    }
    if (/permission denied|42501|row-level security/i.test(msg + " " + (err && err.code))) {
      return "A tabela worksheets não tem permissão para quem está logado, no Supabase.";
    }
    if (/failed to fetch|network/i.test(msg)) return "Sem conexão com o servidor agora.";
    return "Não deu para guardar no banco agora." + (msg ? " (Detalhe: " + msg + ")" : "");
  }

  function isMissing(err) {
    return /relation .* does not exist|42P01|could not find the table|schema cache|permission denied|42501/i
      .test(((err && err.message) || "") + " " + ((err && err.code) || ""));
  }

  function fail(err) {
    if (isMissing(err)) missing = true;
    status("local", errorText(err));
  }

  function time(iso) { return iso ? Date.parse(iso) || 0 : 0; }

  /* ============ mandar pro banco ============ */
  function push() {
    clearTimeout(timer);
    timer = null;
    if (!ctx || !db() || missing) return;
    if (sending) { again = true; return; }
    sending = true;
    var snap = Sheet.snapshot();
    status("saving");
    orNetworkError(db().from(TABLE).upsert({
      user_id: ctx.userId,
      sheet: SHEET,
      player_name: ctx.name() || null,
      data: snap.data,
      updated_at: snap.savedAt || new Date().toISOString()
    }, { onConflict: "user_id,sheet" })).then(function (res) {
      sending = false;
      if (again) { again = false; push(); return; }
      if (res.error) fail(res.error);
      else status("cloud");
    });
  }

  // a cada mudança: manda um instante depois que o aluno para de digitar
  function schedule() {
    if (!ctx || !db() || missing) return;
    status("saving");
    clearTimeout(timer);
    timer = setTimeout(push, WAIT);
  }

  /* ============ abrir ============ */
  // Lê a folha do banco. Se ela for mais nova que a deste navegador (o aluno
  // preencheu em outro computador) e o aluno ainda não mexeu aqui, ela entra
  // no lugar (applied é chamado pra tela se redesenhar). Se a deste
  // navegador for a mais nova, ela vai pro banco.
  function start(userId, nameFn, applied, statusFn) {
    ctx = { userId: userId, name: nameFn || function () { return ""; } };
    status = statusFn || function () {};
    Sheet.onChange(schedule);
    // saindo da página com uma mudança ainda esperando: manda na hora
    global.addEventListener("pagehide", function () { if (timer) push(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden && timer) push(); });

    if (!db()) { status("local", "O login não está ligado ao Supabase."); return; }
    status("loading");
    orNetworkError(db().from(TABLE).select("data,updated_at")
      .eq("user_id", userId).eq("sheet", SHEET).maybeSingle()).then(function (res) {
      if (res.error) { fail(res.error); return; }
      var row = res.data;
      var local = Sheet.snapshot();
      if (row && !Sheet.touched() && time(row.updated_at) > time(local.savedAt)) {
        Sheet.replace(row.data, row.updated_at);
        applied();
        status("cloud");
        return;
      }
      if (local.savedAt && (!row || time(local.savedAt) > time(row.updated_at))) { push(); return; }
      status("cloud");
    });
  }

  global.Sync = {
    start: start
  };
})(window);
