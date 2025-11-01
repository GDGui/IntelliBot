import { swaggerUI } from "../../deps.ts";

export interface SwaggerDocsOptions {
  title: string;
  specUrl: string;
}

/**
 * Cria middleware Hono para Swagger UI.
 */
export const createSwaggerDocs = (options: SwaggerDocsOptions) =>
  swaggerUI({
    url: options.specUrl,
    manuallySwaggerUIHtml: (asset) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${options.title}</title>
    ${ 
      asset.css.map((href) => 
        `<link rel="stylesheet" type="text/css" href="${href}" />`
      ).join("\n    ") 
    }
  </head>
  <body>
    <div id="swagger-ui"></div>
    ${ 
      asset.js.map((src) => 
        `<script src="${src}" crossorigin="anonymous"></script>`
      ).join("\n    ") 
    }
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          dom_id: "#swagger-ui",
          url: ${JSON.stringify(options.specUrl)},
        });
      };
    </script>
  </body>
</html>
    `,
  });
