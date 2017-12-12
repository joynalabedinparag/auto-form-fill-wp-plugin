(function($) {
    var preset_start_date = new Date(2012, 0, 1);
    var preset = {
                    'email_postfix' : "gmail.com, yahoo.com",
                    'people_names' : "john, wick, cena, snow, derek, banas, dave, watson, clark, james",
                    'phone_numbers' : "07001235562, 07001235561, 07001235563, 07001235566",
                  };

    function SmartfillUpForm (sf_settings) {
        $(":input ").not("[type=hidden]").not("[type=button]").each(function () {
            var input_type = $(this).prop('type');
            var field_name = $(this).attr('name');
            var email_postfix = (sf_settings !== false && sf_settings.email_postfix !== '') ? sf_settings.email_postfix : preset.email_postfix;
            var preset_name = (sf_settings !== false && sf_settings.people_names !== '') ? sf_settings.people_names : preset.people_names;
            var preset_phone = (sf_settings !== false && sf_settings.phone_numbers !== '') ? sf_settings.phone_numbers : preset.phone_numbers;

            if(field_name === undefined) {
                return;
            }

            var $field = $(this);

            if (sf_settings.hasOwnProperty(field_name)) {
                $field.val(takeRandom(sf_settings[field_name]));
                return;
            }

            var partial_match_result = checkObjectForFieldNamePartialMatch(sf_settings, $field);
            if(partial_match_result !== false) {
                $field.val(takeRandom(partial_match_result));
                return;
            }

            if (input_type == 'text' || input_type == 'textarea') {
                if (checkInputForPartialIdentifierMatch('name', $field) == true) {
                    $field.val(takeRandom(preset_name));
                } else if (checkInputForPartialIdentifierMatch('email', $field) == true) {
                    $field.val(takeRandom(preset_name) + '@' + takeRandom(email_postfix));
                } else if (checkInputForPartialIdentifierMatch('phone', $field) == true) {
                    $field.val(takeRandom(preset_phone));
                } else if (checkInputForPartialIdentifierMatch('date', $field) == true) {
                    $field.val(getRandomDate());
                } else if (checkInputForPartialIdentifierMatch('expenditure', $field) == true || checkInputForPartialIdentifierMatch('amount', $field) == true) {
                    $field.val(generateRandomNumber(100, 500));
                } else {
                    $field.val('test_' + field_name);
                }
            } else if (input_type == 'select-one') {
                var selected = selectOption($field);
            } else if (input_type == 'number') {
                var rand = generateRandomNumber(100, 500);
                $field.val(rand);
            } else if (input_type == 'radio') {
                $("input:radio[name=" + field_name + "]:first").attr('checked', true);
            } else if (input_type == 'checkbox') {
                $("input:checkbox[name=" + field_name + "]").attr('checked', true);
            } else if (input_type == 'email') {
                $(this).val(takeRandom(preset_name) + '@' + takeRandom(email_postfix));
            } else if (input_type == 'tel') {
                $(this).val(takeRandom(preset_phone));
            }
        });
    }

    function checkObjectForFieldNamePartialMatch(obj, $field) {
        var result = false;
        $.each(obj, function( index, value ) {
            var exist = checkInputForPartialIdentifierMatch(index, $field);
            if(exist == true) {
                result =  value;
            }
        });
        return result;
    }

    function checkInputForPartialIdentifierMatch($pattern, $field) {
        $pattern = $pattern.toLowerCase();
        $identifier = getAllIdentifier($field);
        var result = false;
        var class_exist = false;
        $.each($identifier.class, function( index, value ) {
            if(value.toLowerCase().indexOf($pattern) !== -1) {
                class_exist =  true;
            }
        });
        if($identifier.id.toLowerCase().indexOf($pattern) !== -1 || $identifier.name.toLowerCase().indexOf($pattern) !== -1 || class_exist) {
            result =  true;
        }
        return result;
    }

    function getAllIdentifier($field) {
        var $identifiers = {};
        $identifiers.name = $field.attr('name');
        $identifiers.id = ($field.attr('id'));
        $identifiers.class = "";
        var field_class = $field.attr('class');
        if(field_class !== undefined && field_class !== 'undefined') {
            field_class = field_class.split(/\s+/);
            var $class_arr = {};
            var i = 0;
            $.each(field_class, function (index, value) {
                $class_arr[i] = value;
                i++;
            });
            $identifiers.class = $class_arr;
        }
        return $identifiers;
    }

    function generateRandomNumber(x, y) {
        return Math.floor(Math.random() * ((y-x)+1) + x);
    }

    function takeRandom(array) {
        var val_arr = array.split(',');
        var rand = val_arr[Math.floor(Math.random() * val_arr.length)].trim();
        return rand;
    }

    function getRandomDate() {
        var start = preset_start_date;
        var end =  new Date();
        var date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date = getFormattedDate(date);
    }

    function getFormattedDate(date) {
          var year = date.getFullYear();
          var month = (1 + date.getMonth()).toString();
          month = month.length > 1 ? month : '0' + month;
          var day = date.getDate().toString();
          day = day.length > 1 ? day : '0' + day;
          return month + '/' + day + '/' + year;
    }

    function selectOption(select) {
        var select_length = select.find('option').length;
        var rand = generateRandomNumber(1, select_length);
        if (select.children().length >= rand) {
            var value = select.find('option:eq(' + rand + ')').val();
            if(value === undefined) {
                select.find('option:not(:empty)').first().attr('selected', true);
            } else if (value == '') {
                select.find('option:not(:empty)').first().attr('selected', true);
            } else {
                select.val(value).change();
                return true;
            }
        } else {
            select.find('option:not(:empty)').first().attr('selected', true);
        }
    }

    function extractJsonContainingSpecificKey (myString) {
        var myRegexp = /.*({"email_postfix".*})/g;
        var match = myRegexp.exec(myString);
        var json = false;
        if ( match !== null ) {
            json = JSON.parse(match[1]);
        }
        return json;
    }

    $(document).ready(function () {
        var sf_settings = '';
        jQuery.ajax({
            url: autofill.ajaxurl,
            method : "GET",
            type : "text",
            data: {
                'action':'smartFormFill_get_settings',
            },
            success:function(data) {
                // console.log(data);
                sf_settings = extractJsonContainingSpecificKey(data);
            },
            error: function(errorThrown) {
                console.log(errorThrown);
            }
        });

        var html = "<a href='javascript:void(0)' id='autofill-form-btn' style='display:none; position:fixed; left: 10px;bottom: 10px;'>Auto Fill Form</a>";
        $('body').append(html);

        $("#autofill-form-btn").click(function() {
            SmartfillUpForm (sf_settings);
        }) ;

        // Fill up form when (CTRL + F2) is pressed starts
        var isCtrl = false;
        document.onkeyup = function(e) {
            if(e.which == 17) isCtrl=false;
        }
        
        document.onkeydown = function(e) {
            if(e.which == 17) isCtrl=true;
            if(e.which == 113 && isCtrl == true) {
                console.log('Form Auto Filled. Log in to Admin Panel, navigate to `Auto form fill` menu to set your form preference');
                SmartfillUpForm (sf_settings);
            }
        }
        // Fill up form when (CTRL + F2) is pressed ends.
    });

})( jQuery );

