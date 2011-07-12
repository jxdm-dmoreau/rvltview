var pageMod = require("page-mod");
var data = require("self").data;
pageMod.PageMod({
    include: "http://games.mountyhall.com/mountyhall/MH_Play/Play_vue.php",
    contentScriptWhen: 'end',
    contentScriptFile: [data.url("jquery-1.6.2.min.js"), data.url("my-content-script.js")]
    });



