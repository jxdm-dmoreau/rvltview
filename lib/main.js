var pageMod = require("page-mod");
var data = require("self").data;
pageMod.PageMod({
    include: ["file:///home/dmoreau/Bureau/Play_vue.php.html"],
    contentScriptWhen: 'end',
    contentScriptFile: [data.url("jquery-1.6.2.min.js"), data.url("my-content-script.js")]
    });



