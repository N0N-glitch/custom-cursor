
(() => {
  const STYLE_ID = "custom-cursor-extension-style";

  const DEFAULTS = {
    enabled: false,
    selectedStyle: "matrix"
  };

  const CURSORS = {
    matrix: "matrix.png",
    cyber: "cyber.png",
    neon: "neon.png",
    pixel: "pixel.png"
  };

  function applyCursor(settings) {
    let styleElement = document.getElementById(STYLE_ID);

    const filename = CURSORS[settings.selectedStyle];

    if (!settings.enabled || !filename) {
      if (styleElement) {
        styleElement.remove();
      }
      return;
    }

    const cursorUrl = chrome.runtime.getURL(
      `cursors/${filename}`
    );

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = STYLE_ID;

      (document.head || document.documentElement)
        .appendChild(styleElement);
    }

    styleElement.textContent = `
      html,
      html *,
      body,
      body * {
        cursor: url("${cursorUrl}") 0 0, auto !important;
      }
    `;
  }

  function loadSettings() {
    chrome.storage.local.get(DEFAULTS, settings => {
      if (chrome.runtime.lastError) return;

      applyCursor({
        enabled: settings.enabled === true,
        selectedStyle: CURSORS[settings.selectedStyle]
          ? settings.selectedStyle
          : DEFAULTS.selectedStyle
      });
    });
  }

  loadSettings();

  chrome.storage.onChanged.addListener(
    (changes, areaName) => {
      if (areaName !== "local") return;

      if (changes.enabled || changes.selectedStyle) {
        loadSettings();
      }
    }
  );
})();
