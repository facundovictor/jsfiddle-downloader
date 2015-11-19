var system = require('system');
var page = require('webpage').create();
var fs = require('fs');
var user, directory;
if (system.args.length > 0){
    user = system.args[1];
}
if (system.args.length > 1){
    directory = system.args[2];
    if(fs.makeDirectory(directory)){
        console.log("Directory "+directory+" was created..");
    }
    var lastCharacter = "letra = "+directory[directory.length - 1];
    if (lastCharacter !== '/'){
        directory+="/";
    }
}

var url = "http://jsfiddle.net/api/user/"+user+
          "/demo/list.json?callback=Api&sort=framework&start=0&limit=50000";

function evaluateCurrentPage(){
    /**
     *  Recover the script HTML tag of the library identified by 'selectedLib'.
     **/
    function get_lib_url(selectedLib){
        switch (parseInt(selectedLib, 10)) {
            case 112:
                return '<script type="text/javascript" '+
                    'src="http://ajax.googleapis.com/ajax/libs/'+
                    'jquery/1.8.2/jquery.min.js"></script>';
            case 101:
                return '<script type="text/javascript" '+
                    'src="http://ajax.googleapis.com/ajax/libs/'+
                    'jquery/1.7.2/jquery.min.js"></script>';
            case 49:
                return '<script type="text/javascript" '+
                    'src="http://code.jquery.com/jquery-1.4.4.min.js">'+
                    '</script>';
            case 83:
                return '<script type="text/javascript" '+
                    'src="http://code.jquery.com/jquery-1.7.1.min.js">'+
                    '</script>';
            case 147:
                return '<script type="text/javascript" '+
                    'src="http://cdn.sencha.com/ext/gpl/4.2.0/ext-all.js">'+
                    '</script>';
            default:
                return '';
        }
        console.log("Javascript library not found: "+selectedLib);
        return "";
    }

    // Extract library
    var selectedLib = document.getElementById('js_lib').value;
    var jQ_url = get_lib_url(selectedLib);

    // Extract HTML
    var compHtml = document.getElementById('id_code_html').value;

    // Extract CSS
    var compCSS = '<style type="text/css">'+
                  document.getElementById('id_code_css').value+
                  '</style>';

    // Fiddle the jsFiddle
    var compJS = '<script type="text/javascript">'+
                 document.getElementById('id_code_js').value+
                 '</script>';

    // Descriptive comments of the fiddle 
    var compTitle = '<!-- Title: '+
                     document.getElementById('id_title').value + '-->';
    var compDesc = '<!-- Description: '+
                   document.getElementById('id_description').value + '-->';
    var compDescRes = '<!-- Resources: \n';

    var selected_resources = document.getElementById("js_lib").getSelected(),
        amount_of_selected_resources = selected_resources.length;
    for(var i = 0; i < amount_of_selected_resources; i++){
        compDescRes += '          '+ selected_resources[i].innerHTML + '\n';
    }
    compDescRes += '-->';

    // Fiddles External Resources
    var compResources = '',
        amount_of_resources = resources.length;
    for(var j = 0; j < amount_of_resources; j++){
        var external_resource_J = "external_resource_"+resources[j];
        compResources += '<script type="text/javascript" src="' +
            document.getElementById(external_resource_J).children[0].href +
            '"></script> \n';
    }

    var result = "<!DOCTYPE html><html><head><title>"+
        document.getElementById('id_title').value+
        "</title>" + "\n" +
        compTitle + "\n" +
        compDesc + "\n" +
        compDescRes + "\n" +
        compResources + "\n" +
        compCSS + "\n" + 
        "</head><body> \n" + 
        compHtml + "\n" +
        jQ_url + "\n" + 
        compJS + "\n " + 
        "</body></html>";

    return result;
}


var getFiddle = function(list,i){
    if (i > 0){
        var id_fiddle = "",
            url_fiddle = "http:"+list[i].url,
            splitted_url_array = url_fiddle.split("/");

        if (splitted_url_array.length === 6){
            id_fiddle = splitted_url_array[4];
        }else{
            console.log("Unexpected url format, may be it changed since this "+
                        "script was built...");
            phantom.exit();
        }

        page.open(url_fiddle, function(status) {
            if (status !== 'success') {
                console.log('Unable to access network');
            } else {
                console.log(""+i+
                            " --> jsFiddle with id '"+id_fiddle+
                            "' and url '"+url_fiddle+
                            "'...");
                var result = page.evaluate(evaluateCurrentPage);
                fs.write(""+directory+id_fiddle+".html", result);
                console.log("Saved as "+directory+id_fiddle+".html... \n");
            }
            setTimeout(function(){
                getFiddle(list,i - 1);
            },100);
        });
    }else{
        console.log("Amount of jsFiddles = "+list.length);
        phantom.exit();
    }
};

page.open(url, function (status) {
    var jsonSource = page.plainText.substring(4,page.plainText.length - 3);
    var resultObject = JSON.parse(jsonSource);
    var list = resultObject.list;
    var amount = list.length;
    console.log("A total of "+amount+" scripts was found: \n\nDownloading...\n");
    setTimeout(function(){
        getFiddle(list,amount - 1);
    },100);
});
