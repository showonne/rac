const path = require('path')
const typescript = require('rollup-plugin-typescript2')
const { terser } = require('rollup-plugin-terser')
const eslint = require('@rollup/plugin-eslint')
const version = require('./package.json').version

const banner = `
/*!
 * Rac.js v${version}
 * (c) 2021-${new Date().getFullYear()} Showonne
 * Released under the MIT License.
 */
`

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/rac.umd.js', format: 'umd', name: 'rac', sourcemap: true, banner },
    { file: 'dist/rac.js', format: 'esm', sourcemap: true, banner }
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