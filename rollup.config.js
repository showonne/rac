const typescript = require('rollup-plugin-typescript2')
const { terser } = require('rollup-plugin-terser')
const eslint = require('@rollup/plugin-eslint')

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/rac.umd.js', format: 'umd', name: 'rac' }
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    terser(),
    eslint()
  ]
}