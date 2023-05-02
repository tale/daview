import rakkas from 'rakkasjs/vite-plugin'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	plugins: [tsconfigPaths(), rakkas()]
})
