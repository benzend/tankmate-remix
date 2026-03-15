import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import esbuild from 'esbuild'
import fsExtra from 'fs-extra'
import { globSync } from 'glob'

const pkg = fsExtra.readJsonSync(path.join(process.cwd(), 'package.json'))

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const here = (...s: Array<string>) => path.join(__dirname, ...s)
const globsafe = (s: string) => s.replace(/\\/g, '/')

const allFiles = globSync(globsafe(here('../server/**/*.*')), {
	ignore: [
		'server/dev-server.js', // for development only
		'**/tsconfig.json',
		'**/eslint*',
		'**/__tests__/**',
	],
})

const entries = []
for (const file of allFiles) {
	if (/\.(ts|js|tsx|jsx)$/.test(file)) {
		entries.push(file)
	} else {
		const dest = file.replace(here('../server'), here('../server-build'))
		fsExtra.ensureDirSync(path.parse(dest).dir)
		fsExtra.copySync(file, dest)
		console.log(`copied: ${file.replace(`${here('../server')}/`, '')}`)
	}
}

console.log()
console.log('building...')

esbuild
	.build({
		entryPoints: entries,
		outdir: here('../server-build'),
		target: [`node${pkg.engines.node}`],
		platform: 'node',
		sourcemap: true,
		format: 'esm',
		logLevel: 'info',
	})
	.then(() => {
		// esbuild compiles .ts → .js but doesn't rewrite import specifiers.
		// Post-process output to fix .ts/.tsx extensions in import/export paths.
		const outputFiles = globSync(globsafe(here('../server-build/**/*.js')))
		for (const file of outputFiles) {
			let content = fs.readFileSync(file, 'utf-8')
			const updated = content.replace(
				/(from\s+["'])(\.\.?\/[^"']*?)\.tsx?(["'])/g,
				'$1$2.js$3',
			)
			if (updated !== content) {
				fs.writeFileSync(file, updated)
			}
		}
		console.log(`Rewrote .ts extensions in ${outputFiles.length} output files`)
	})
	.catch((error: unknown) => {
		console.error(error)
		process.exit(1)
	})
