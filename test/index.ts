import { start } from "../dist/index";
import { extendQuery } from "./util/CustomQuery";

start({
    beforeStart: () => {
        extendQuery()
    }
});
