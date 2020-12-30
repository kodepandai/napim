import { ServerResponse } from "http";
import { start, router } from "../dist/index";

router.get('/heloo', (req, res) => {
    res.json('hello world')
})
start();
