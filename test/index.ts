import { start } from "../dist/index";
import { extendQuery } from "./util/CustomQuery";
import { extendRule } from "./util/CustomValidation";

start({
    beforeStart: () => {
        extendQuery()
        extendRule()
    }
});
