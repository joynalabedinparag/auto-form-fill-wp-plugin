(function($) {
    $("body").on('click', '#smartfill-add-field', function() {
        $("#smartfill-add-form").slideToggle();
    });

    $("body").on('click', '#smartfill-add-form-add-field-submit-btn', function() {
        var identifier = $("#smartfill-add-field-identifier").val();
        var identifier_field_name = identifier.replace(/ /g,"_");
        var field_html = "<tr><th scope='row'>" + identifier + "</th><td><textarea name='smartFormFill_settings["+identifier_field_name+"]'></textarea></td></tr>";
        $(".form-table tbody").append(field_html);
    });

    $("body").on('click', '.smartfill-field-remove-btn', function() {
       $(this).closest('tr').remove();
    });

})( jQuery );
