import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://localhost:3000/openapi.json',
    output: {
      target: './src/api/generated.ts',
      client: 'react-query',
    },
  },
});
