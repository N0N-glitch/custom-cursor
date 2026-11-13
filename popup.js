
const DEFAULTS = {
  enabled: false,
  selectedStyle: "matrix"
};

const STYLE_NAMES = {
  matrix: "MATRIX",
  cyber: "CYBER",
  neon: "NEON",
  pixel: "PIXEL"
};

const cards = document.querySelectorAll(".cursor-card");
const toggleButton = document.getElementById("toggleButton");
const restoreButton = document.getElementById("restoreButton");

const statusText = document.getElementById("statusText");
const selectedText = document.getElementById("selectedText");
const message = document.getElementById("message");

let settings = { ...DEFAULTS };

function showMessage(text) {
  message.textContent = text;
}

function render() {
  statusText.textContent = settings.enabled
    ? "ATIVADO"
    : "DESATIVADO";

  toggleButton.classList.toggle("active", settings.enabled);

  toggleButton.setAttribute(
    "aria-pressed",
    String(settings.enabled)
  );

  selectedText.textContent =
    STYLE_NAMES[settings.selectedStyle] || "MATRIX";

  cards.forEach(card => {
    const selected =
      card.dataset.style === settings.selectedStyle;

    card.classList.toggle("selected", selected);

    card.setAttribute(
      "aria-pressed",
      String(selected)
    );
  });
}

function saveSettings(newSettings, successMessage) {
  const nextSettings = {
    enabled: Boolean(newSettings.enabled),
    selectedStyle: STYLE_NAMES[newSettings.selectedStyle]
      ? newSettings.selectedStyle
      : DEFAULTS.selectedStyle
  };

  chrome.storage.local.set(nextSettings, () => {
    if (chrome.runtime.lastError) {
      showMessage("Erro ao salvar configurações.");
      return;
    }

    settings = nextSettings;
    render();
    showMessage(successMessage);
  });
}

function loadSettings() {
  chrome.storage.local.get(DEFAULTS, data => {
    if (chrome.runtime.lastError) {
      showMessage("Erro ao carregar configurações.");
      return;
    }

    settings = {
      enabled: data.enabled === true,
      selectedStyle: STYLE_NAMES[data.selectedStyle]
        ? data.selectedStyle
        : DEFAULTS.selectedStyle
    };

    render();
  });
}

cards.forEach(card => {
  card.addEventListener("click", () => {
    const style = card.dataset.style;

    if (!STYLE_NAMES[style]) return;

    saveSettings(
      {
        enabled: true,
        selectedStyle: style
      },
      `${STYLE_NAMES[style]} selecionado!`
    );
  });
});

toggleButton.addEventListener("click", () => {
  saveSettings(
    {
      ...settings,
      enabled: !settings.enabled
    },
    settings.enabled
      ? "Personalização desativada."
      : "Personalização ativada."
  );
});

restoreButton.addEventListener("click", () => {
  saveSettings(
    {
      enabled: false,
      selectedStyle: "matrix"
    },
    "Cursor padrão restaurado."
  );
});

loadSettings();
