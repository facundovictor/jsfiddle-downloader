var system = require('system');
var page = require('webpage').create();
var fs = require('fs');

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
                  document.getElementById('id_code_css').value + '</style>';

    // Fiddle the jsFiddle
    var compJS = '<script type="text/javascript">' +
                 document.getElementById('id_code_js').value + '</script>';

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

    var resultado = "<!DOCTYPE html><html><head><title>"+
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

    return resultado;
}

page.open(system.args[1], function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    } else {
        var result = page.evaluate(evaluateCurrentPage);
        if (!system.args[2]) {
            console.log(result);
        } else {
            fs.write(system.args[2], result);
            console.log("Saved output to " + system.args[2]);
        }
    }
    phantom.exit();
});
