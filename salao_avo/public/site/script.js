(function () {
  "use strict";

  var WHATSAPP_NUMERO = "5511954085967";
  var WHATSAPP_MSG_PADRAO =
    "Olá! Gostaria de agendar um horário no Rosário Cabeleireiros & Cia.";
  var isLocalPreview = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(
    window.location.hostname
  ) && window.location.port !== "3000";
  var API_BASE = isLocalPreview
    ? window.location.protocol + "//" + window.location.hostname + ":3000"
    : window.location.origin;
  var LEAD_URL = API_BASE + "/api/publico/leads";

  function urlWhatsApp(texto) {
    return (
      "https://wa.me/" +
      WHATSAPP_NUMERO +
      "?text=" +
      encodeURIComponent(texto)
    );
  }

  function abrirWhatsApp(texto, janela) {
    var url = urlWhatsApp(texto);
    if (!janela || janela.closed) return false;
    janela.location.href = url;
    return true;
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

  function setStatus(texto, tipo, link) {
    var el = document.getElementById("formStatus");
    if (!el) return;
    el.textContent = texto;
    el.classList.remove("form__status--erro", "form__status--ok");
    if (tipo) el.classList.add("form__status--" + tipo);
    if (link) {
      var ancora = document.createElement("a");
      ancora.href = link;
      ancora.target = "_blank";
      ancora.rel = "noopener noreferrer";
      ancora.textContent = "Abrir WhatsApp";
      el.appendChild(document.createTextNode(" "));
      el.appendChild(ancora);
    }
  }

  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function definirMenu(aberto) {
    toggle.setAttribute("aria-expanded", String(aberto));
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("nav__menu--aberto", aberto);
  }

  function menuAberto() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      definirMenu(!menuAberto());
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        definirMenu(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuAberto()) {
        definirMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (menuAberto() && !menu.contains(e.target) && !toggle.contains(e.target)) {
        definirMenu(false);
      }
    });

    // Ao girar o tablet para paisagem o menu vira barra: limpa o estado aberto.
    var desktop = window.matchMedia("(min-width: 960px)");
    var aoMudarLargura = function (mq) {
      if (mq.matches) definirMenu(false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", aoMudarLargura);
    else if (desktop.addListener) desktop.addListener(aoMudarLargura);
  }

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
  var botao = document.getElementById("btnEnviar");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nome = document.getElementById("nome");
      var telefone = document.getElementById("telefone");
      var servico = document.getElementById("servico");
      var data = document.getElementById("data");
      var consentimento = document.getElementById("consentimentoWhatsapp");
      var campos = [nome, telefone, servico, data];
      var valido = true;

      function marcarErro(campo, comErro) {
        if (!campo) return;
        campo.classList.toggle("erro", comErro);
        if (comErro) campo.setAttribute("aria-invalid", "true");
        else campo.removeAttribute("aria-invalid");
        if (comErro) valido = false;
      }

      campos.forEach(function (c) {
        marcarErro(c, false);
      });
      setStatus("");

      marcarErro(nome, !nome.value.trim());
      marcarErro(telefone, soDigitos(telefone.value).length < 10);
      marcarErro(servico, !servico.value);
      marcarErro(data, !data.value);

      var grupoConsentimento = consentimento && consentimento.closest(".form__consentimento");
      var semConsentimento = !consentimento || !consentimento.checked;
      if (grupoConsentimento) grupoConsentimento.classList.toggle("erro", semConsentimento);
      if (consentimento) {
        if (semConsentimento) consentimento.setAttribute("aria-invalid", "true");
        else consentimento.removeAttribute("aria-invalid");
      }
      if (semConsentimento) valido = false;

      if (!valido) {
        var primeiro = form.querySelector("[aria-invalid='true']");
        if (primeiro) primeiro.focus();
        setStatus("Preencha os campos e autorize a mensagem de boas-vindas pelo WhatsApp.", "erro");
        return;
      }

      var payload = {
        nome: nome.value.trim(),
        telefone: soDigitos(telefone.value),
        servico: servico.value,
        data: data.value,
        consentimento: true,
      };

      var mensagem =
        WHATSAPP_MSG_PADRAO +
        "\n\n" +
        "*Nome:* " + payload.nome + "\n" +
        "*Telefone:* " + telefone.value.trim() + "\n" +
        "*Serviço:* " + payload.servico + "\n" +
        "*Data preferida:* " + formatarDataBR(payload.data);

      if (botao) {
        botao.disabled = true;
        botao.textContent = "Salvando contato…";
      }

      // Abre uma janela durante o clique para evitar bloqueio após a chamada à API.
      var janelaWhatsApp = window.open("about:blank", "_blank");
      if (janelaWhatsApp) janelaWhatsApp.opener = null;

      fetch(LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().catch(function () {
              return {};
            }).then(function (body) {
              throw new Error(body.mensagem || "Não foi possível salvar o contato.");
            });
          }
          return res.json();
        })
        .then(function (resultado) {
          var url = urlWhatsApp(mensagem);
          var boasVindas = resultado.boasVindas;
          var avisoBoasVindas = !resultado.novoCadastro
            ? " Esse telefone já estava cadastrado; não enviamos outra mensagem automática."
            : boasVindas && boasVindas.status === "enviada"
              ? " A mensagem de boas-vindas foi enviada para seu número."
              : boasVindas && boasVindas.status === "na_fila"
                ? " A mensagem de boas-vindas será enviada quando o WhatsApp do salão conectar."
              : " O contato foi salvo, mas não foi possível enviar a mensagem automática.";
          var abriuWhatsApp = abrirWhatsApp(mensagem, janelaWhatsApp);
          setStatus(
            "Contato salvo. Seu horário ainda será confirmado pelo salão." + avisoBoasVindas +
              (abriuWhatsApp ? " Abrindo o WhatsApp…" : " Continue pelo link:"),
            "ok",
            abriuWhatsApp ? null : url
          );
        })
        .catch(function (err) {
          if (janelaWhatsApp && !janelaWhatsApp.closed) janelaWhatsApp.close();
          setStatus(
            (err && err.message ? err.message + " " : "") +
              "Seu contato não foi confirmado. Tente novamente antes de abrir o WhatsApp.",
            "erro"
          );
        })
        .finally(function () {
          if (botao) {
            botao.disabled = false;
            botao.textContent = "Enviar pelo WhatsApp";
          }
        });
    });
  }
})();
