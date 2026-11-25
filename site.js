/* AI cool - newsletter mensuelle via Cloudflare Worker + Resend */
(function () {
  var NEWSLETTER_ENDPOINT = "https://aicool-newsletter.david-8a1.workers.dev";

  function initNewsletterForms() {
    var forms = document.querySelectorAll(".js-newsletter-form");
    if (!forms.length) return;

    forms.forEach(function (form) {
      var input = form.querySelector('input[type="email"]');
      var button = form.querySelector('button[type="submit"]');
      var status = form.querySelector(".newsletter-status");
      var sourceField = form.querySelector('input[name="source"]');

      // Champ honeypot invisible pour bloquer les robots sans gener les humains
      var hp = form.querySelector('input[name="company_fax"]');
      if (!hp) {
        hp = document.createElement("input");
        hp.type = "text";
        hp.name = "company_fax";
        hp.tabIndex = -1;
        hp.autocomplete = "off";
        hp.setAttribute("aria-hidden", "true");
        hp.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
        form.appendChild(hp);
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!input || !input.value.trim()) return;

        var email = input.value.trim();
        var source = sourceField ? sourceField.value : window.location.pathname;
        var endpoint = form.getAttribute("data-endpoint") || NEWSLETTER_ENDPOINT;

        if (button) button.disabled = true;
        if (status) {
          status.textContent = "Inscription en cours...";
          status.className = "newsletter-status";
        }

        fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            source: source,
            company_fax: hp ? hp.value : ""
          })
        })
          .then(function (res) {
            return res.json().catch(function () {
              return {};
            }).then(function (data) {
              if (!res.ok || data.ok === false) {
                throw new Error(data.error || "HTTP " + res.status);
              }
              input.value = "";
              if (status) {
                status.textContent = "Merci ! Vous recevrez le prochain récap mensuel d'AI cool.";
                status.className = "newsletter-status is-ok";
              }
            });
          })
          .catch(function () {
            if (status) {
              status.textContent =
                "Impossible d'enregistrer pour l'instant. Écrivez à david@webiwant.com pour être ajouté.";
              status.className = "newsletter-status is-err";
            }
          })
          .finally(function () {
            if (button) button.disabled = false;
          });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewsletterForms);
  } else {
    initNewsletterForms();
  }
})();
