function addPlugins(pluginList) {
  let pluginConfig = {
    ga: false,
    search: false,
    tags: "",
  };
  let scriptTags = "";
  for (let i = 0; i < pluginList.length; i++) {
    if (pluginList[i] == "docsify-copy-code") {
      scriptTags +=
        "<script src='//cdn.jsdelivr.net/npm/docsify-copy-code'></script>";
    }
    if (pluginList[i] == "full-text-search") {
      scriptTags +=
        "<script src='//cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js'></script>";
      pluginConfig.search = true;
    }
    if (pluginList[i] == "google-analytics") {
      pluginConfig.ga = true;
    }
    if (pluginList[i] == "emoji") {
      scriptTags +=
        "<script src='//cdn.jsdelivr.net/npm/docsify/lib/plugins/emoji.min.js'></script>";
    }
    if (pluginList[i] == "zoom-image") {
      scriptTags +=
        "<script src='//cdn.jsdelivr.net/npm/docsify/lib/plugins/zoom-image.min.js'></script>";
    }
  }
  pluginConfig.tags = scriptTags;
  return pluginConfig;
}

module.exports = { addPlugins };
