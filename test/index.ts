import { start, Log, injectModule, app, express } from "../dist/index";
import { router } from "../dist/router";

const moduleA = 'module A'
const moduleB = 'module B'
injectModule([
    moduleA,
    moduleB
])
router.get('/heloo', (req, res) => {
    res.json('hello world')
})

start();