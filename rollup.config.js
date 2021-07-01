import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json' 

const makeBuild = (dir, format)=>{
    let tsConfig = { sourceMap: false, declaration: false}
    if(format == 'es'){
        tsConfig.declaration = true
        tsConfig['declarationDir'] =  'dist/esm'
    }
    return {
        external: ['node-input-validator/cjs', 'validator', 'dotenv', 'simple-node-logger', 'body-parser', 'polka', 'knex'],
        input: 'src/index.ts',
        output: [
            { dir, format, exports: 'auto' },
        ],
        plugins: [
            typescript(tsConfig),
            commonjs(),
            resolve(),
            json(),
        ] 
    }
}
export default [
    makeBuild('dist/esm', 'es'),
    makeBuild('dist/cjs', 'cjs'),
];