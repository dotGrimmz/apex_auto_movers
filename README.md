
  # apexautomovers

  This is a code bundle for apexautomovers. The original project is available at https://www.figma.com/design/Mkk3ZElWsAmG9GUsk01VQ2/apexautomovers.

  ## Running the code

  Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Production API configuration

The frontend now reads `VITE_API_BASE_URL` at build time. In development it defaults to `/api` (the local Express server). In production set `VITE_API_BASE_URL` to the Supabase Functions base URL, e.g. `https://bcjoptzhizulftdxewaj.functions.supabase.co`.
  
