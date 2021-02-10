const typescript = require('rollup-plugin-typescript2')
const { terser } = require('rollup-plugin-terser')

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
    terser()
  ]
}