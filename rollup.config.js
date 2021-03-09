const path = require('path')
const typescript = require('rollup-plugin-typescript2')
const { terser } = require('rollup-plugin-terser')
const eslint = require('@rollup/plugin-eslint')

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/rac.umd.js', format: 'umd', name: 'rac' }
  ],
  plugins: [
    terser(),
    eslint({
      throwOnError: true,
      include: ['src/**/*.ts']
    }),
    typescript({
      verbosity: 0,
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      useTsconfigDeclarationDir: true
    })
  ]
}