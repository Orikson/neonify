/*
  Author: Eron Ristich
  Date: 9/23/21
  File: ./neonify/static/javascript/responses.js
  Description: Handlers to manage responses passed to the program in order to run python scripts without reloading the page  
*/

$(function() {
    $('#neonify').click(function() {
        $.getJSON($SCRIPT_ROOT + '/_neonify', {}, function(data) {
            $("#neonified").text(data.response);
        });
        return false;
    });
});