const { cosmiconfig } = require('cosmiconfig');
const path = require('path');
const fs = require('fs');
const os = require('os');

const explorer = cosmiconfig('docforge');

// Global config file location
const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.docforgerc.json');

const DEFAULT_CONFIG = {
  style: 'professional',
  format: 'A4',
  landscape: false,
  markdown: {
    toc: false,
    headerFooter: true,
  },
  html: {
    wait: 0,
    selector: null,
  },
  customCss: '',
};

function loadGlobalConfig() {
  try {
    if (fs.existsSync(GLOBAL_CONFIG_PATH)) {
      const content = fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    // Global config not found or invalid
  }
  return {};
}

function saveGlobalConfig(config) {
  fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2));
}

function getGlobalConfigPath() {
  return GLOBAL_CONFIG_PATH;
}

async function loadConfig() {
  // Start with defaults
  let config = { ...DEFAULT_CONFIG };

  // Merge global config
  const globalConfig = loadGlobalConfig();
  config = { ...config, ...globalConfig };

  // Merge local config (highest priority)
  try {
    const result = await explorer.search();
    if (result) {
      config = { ...config, ...result.config };
    }
  } catch (error) {
    // Local config not found or invalid
  }

  return config;
}

module.exports = {
  loadConfig,
  loadGlobalConfig,
  saveGlobalConfig,
  getGlobalConfigPath,
  DEFAULT_CONFIG,
};

