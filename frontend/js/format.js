(function (global) {
  "use strict";

  // Formatação dos números e das datas, do jeito brasileiro (a mesma da
  // Teoria das caixas, só com o que esta folha usa).

  var fmtCents = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // o número de uma célula de dinheiro, sem o "R$" (que já está desenhado
  // do lado dela): "1.200,00"
  function plain(v) {
    return fmtCents.format(v || 0);
  }

  /* ============ meses ============ */
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
    "agosto", "setembro", "outubro", "novembro", "dezembro"];

  // um mês do ano, { y: 2027, m: 4 }: "abril de 2027"
  function monthYear(d) {
    return MESES[d.m - 1] + " de " + d.y;
  }

  // o mês de hoje, do relógio do computador
  function thisMonth() {
    var now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1 };
  }

  // escapa o texto pro HTML e prende o "R$" ao número (espaço inquebrável),
  // pra "R$" nunca ficar no fim de uma linha e o valor na outra
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/R\$ /g, "R$ ");
  }

  global.Format = {
    plain: plain,
    monthYear: monthYear,
    thisMonth: thisMonth,
    esc: esc
  };
})(window);
