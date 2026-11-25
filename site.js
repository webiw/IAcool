/* AI cool - progressive enhancement for newsletter signup */
(function () {
  // Remplacez cette URL par votre endpoint Formspree dedie a aicool.fr
  // Exemple : "https://formspree.io/f/abcd1234"
  var NEWSLETTER_ENDPOINT = "";
  var FALLBACK_EMAIL = "david@webiwant.com";

  function initNewsletterForms() {
    var forms = document.querySelectorAll(".js-newsletter-form");
    if (!forms.length) return;

    forms.forEach(function (form) {
      var input = form.querySelector('input[type="email"]');
      var button = form.querySelector('button[type="submit"]');
      var status = form.querySelector(".newsletter-status");
      var sourceField = form.querySelector('input[name="source"]');

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!input || !input.value.trim()) return;

        var email = input.value.trim();
        var source = sourceField ? sourceField.value : window.location.pathname;
        var endpoint = form.getAttribute("data-endpoint") || NEWSLETTER_ENDPOINT;

        if (!endpoint) {
          var subject = encodeURIComponent("Inscription newsletter mensuelle aicool.fr");
          var body = encodeURIComponent(
            "Bonjour David,\n\nJe souhaite recevoir le recap mensuel d'aicool.fr.\nMon email : " +
              email +
              "\nPage : " +
              source +
              "\n"
          );
          if (status) {
            status.textContent =
              "Ouverture de votre messagerie pour valider l'inscription avec " + email + ".";
            status.className = "newsletter-status is-ok";
          }
          window.location.href = "mailto:" + FALLBACK_EMAIL + "?subject=" + subject + "&body=" + body;
          return;
        }

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
            site: "aicool.fr"
          })
        })
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            input.value = "";
            if (status) {
              status.textContent = "Merci ! Vous recevrez le prochain recap mensuel d'aicool.fr.";
              status.className = "newsletter-status is-ok";
            }
          })
          .catch(function () {
            if (status) {
              status.textContent =
                "Impossible d'enregistrer pour l'instant. Ecrivez a david@webiwant.com pour etre ajoute.";
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
