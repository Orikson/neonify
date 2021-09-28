/*
  Author: Eron Ristich
  Date: 9/23/21
  File: ./neonify/static/javascript/responses.js
  Description: Handlers to manage responses passed to the program in order to run python scripts without reloading the page  
*/

$(function() {
    $("#neonify").click(function() {
        /*$.getJSON($SCRIPT_ROOT + '/_neonify', {}, function(data) {
            $("#neonified").text(data.response);
        });*/
        
        
        $.ajax({
            type: "POST",
            url: $SCRIPT_ROOT + "/_neonify",
            data:{
              imageBase64: element.toDataURL()
            },
            beforeSend: function() {
                $("#neonified").text("Status: Processing...");
            },
            error: function(xhr) {
                $("#neonified").text("Status: Error, please try again; " + xhr.statusText + xhr.responseText);
            }
        }).done(function(data) {
            $("#neonified").text("Status: Done!");
            $("#result").attr('src', data.img);
        });
        //return false;
    });
});