// Generates docsify enabled html with no config
function generateHTML(user, repo) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${repo}</title><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta name="description" content="Description"/> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/> <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"/> </head> <body> <div id="app"></div><script>window.$docsify={name: '${repo}', repo: '${user}/${repo}'}; </script> <script src="//cdn.jsdelivr.net/npm/docsify@4"></script> </body></html>`;
}

// Generated docsify enabled html with config and plugins
function generateHtmlWithConfig(config) {
  if (config.enablePlugins) {
    let ga = ""; // google analytics code
    let search = ""; // search path

    if (config.plugins.ga) {
      ga = `, ga: ${config.gaCode}`;
    }
    if (config.plugins.search) {
      search = ', search: ["/"]';
    }

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${config.repo}</title><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta name="description" content="${config.description}"/> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/> <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"/> </head> <body> <div id="app"></div><script>window.$docsify={name: '${config.repo}', repo: '${config.user}/${config.repo}'${ga}${search}}; </script> <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>${config.plugins.tags}</body></html>`;
  }

  // If no plugins, but config exists for description
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${config.repo}</title><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta name="description" content="${config.description}"/> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/> <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"/> </head> <body> <div id="app"></div><script>window.$docsify={name: '${config.repo}', repo: '${config.user}/${config.repo}'}; </script> <script src="//cdn.jsdelivr.net/npm/docsify@4"></script> </body></html>`;
}

module.exports = { generateHTML, generateHtmlWithConfig };
