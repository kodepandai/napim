import { start, injectModule, router } from "../dist/index";

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
