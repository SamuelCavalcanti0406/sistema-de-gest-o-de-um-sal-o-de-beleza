(function () {
  "use strict";

  var WHATSAPP_NUMERO = "5511987654321";
  var WHATSAPP_MSG_PADRAO =
    "Olá! Gostaria de agendar um horário no Salão da Vó.";

  function track(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }

  function abrirWhatsApp(texto) {
    var url =
      "https://wa.me/" +
      WHATSAPP_NUMERO +
      "?text=" +
      encodeURIComponent(texto);
    window.open(url, "_blank", "noopener");
  }

  function soDigitos(valor) {
    return String(valor || "").replace(/\D/g, "");
  }

  function mascararTelefone(valor) {
    var d = soDigitos(valor).slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) {
      return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    }
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  function formatarDataBR(iso) {
    if (!iso) return "";
    var partes = iso.split("-");
    if (partes.length !== 3) return iso;
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var aberto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!aberto));
      toggle.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
      menu.classList.toggle("nav__menu--aberto", !aberto);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
        menu.classList.remove("nav__menu--aberto");
      });
    });
  }

  document.querySelectorAll(".js-link-whatsapp").forEach(function (el) {
    el.addEventListener("click", function () {
      track("click_whatsapp", {
        event_category: "engagement",
        event_label: el.getAttribute("aria-label") || "whatsapp",
      });
    });
  });

  var campoData = document.getElementById("data");
  if (campoData) {
    var hoje = new Date();
    var yyyy = hoje.getFullYear();
    var mm = String(hoje.getMonth() + 1).padStart(2, "0");
    var dd = String(hoje.getDate()).padStart(2, "0");
    campoData.min = yyyy + "-" + mm + "-" + dd;
  }

  var campoTel = document.getElementById("telefone");
  if (campoTel) {
    campoTel.addEventListener("input", function () {
      campoTel.value = mascararTelefone(campoTel.value);
    });
  }

  var form = document.getElementById("formAgendamento");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nome = document.getElementById("nome");
      var telefone = document.getElementById("telefone");
      var servico = document.getElementById("servico");
      var data = document.getElementById("data");
      var campos = [nome, telefone, servico, data];
      var valido = true;

      campos.forEach(function (c) {
        if (c) c.classList.remove("erro");
      });

      if (!nome.value.trim()) {
        nome.classList.add("erro");
        valido = false;
      }

      if (soDigitos(telefone.value).length < 10) {
        telefone.classList.add("erro");
        valido = false;
      }

      if (!servico.value) {
        servico.classList.add("erro");
        valido = false;
      }

      if (!data.value) {
        data.classList.add("erro");
        valido = false;
      }

      if (!valido) {
        var primeiro = form.querySelector(".erro");
        if (primeiro) primeiro.focus();
        return;
      }

      var mensagem =
        WHATSAPP_MSG_PADRAO +
        "\n\n" +
        "*Nome:* " + nome.value.trim() + "\n" +
        "*Telefone:* " + telefone.value.trim() + "\n" +
        "*Serviço:* " + servico.value + "\n" +
        "*Data preferida:* " + formatarDataBR(data.value);

      track("generate_lead", {
        event_category: "conversion",
        method: "whatsapp_form",
        service: servico.value,
      });

      abrirWhatsApp(mensagem);
    });
  }
})();
