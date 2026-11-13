
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

  let currentSettings = { ...DEFAULTS };
  let observer = null;

  function applyCursor() {
    const filename = CURSORS[currentSettings.selectedStyle];

    if (!currentSettings.enabled || !filename) {
      const oldStyle = document.getElementById(STYLE_ID);
      if (oldStyle) oldStyle.remove();
      return;
    }

    const root = document.documentElement;
    if (!root) return;

    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      root.appendChild(style);
    }

    const url = chrome.runtime.getURL(
      `cursors/${filename}`
    );

    style.textContent = `
      html,
      html *,
      body,
      body * {
        cursor: url("${url}") 0 0, auto !important;
      }
    `;
  }

  function loadSettings() {
    chrome.storage.local.get(DEFAULTS, data => {
      if (chrome.runtime.lastError) return;

      currentSettings = {
        enabled: data.enabled === true,
        selectedStyle: CURSORS[data.selectedStyle]
          ? data.selectedStyle
          : DEFAULTS.selectedStyle
      };

      applyCursor();
    });
  }

  function observeDocument() {
    if (!document.documentElement || observer) return;

    observer = new MutationObserver(() => {
      if (currentSettings.enabled) applyCursor();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    applyCursor();
  }

  if (document.documentElement) {
    observeDocument();
  } else {
    const waitForRoot = new MutationObserver(() => {
      if (document.documentElement) {
        waitForRoot.disconnect();
        observeDocument();
      }
    });

    waitForRoot.observe(document, {
      childList: true,
      subtree: true
    });
  }

  loadSettings();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    if (changes.enabled || changes.selectedStyle) {
      loadSettings();
    }
  });
})();
