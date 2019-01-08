$(document).on('click', '.newrow', function(event){
    event.preventDefault();
    var newRow = $(this).parent().find('tr:last').clone();
    newRow.find('input:first').val('Course Name');
    $(this).parent().find('tr:last').after(newRow);
});

$(document).on('click', '.delete-button', function(event){
    event.preventDefault();
    $(this).parents('tr').remove();
    calculate();
});

$(document).on('keyup', '#sap-form input', function(){ calculate();});

$(document).on('click', '#sap-form input[type="checkbox"]', function(){ calculate();});

function calculate(){
    // get an associative array of just the values.
    var values = {};
    $('#sap-form :input').each(function() {
        values[this.name] = $(this).val().toLowerCase();
    });
    
    var gpatable = {};
    gpatable['a+'] = 4.3;
    gpatable['a'] = 4.0;
    gpatable['a-'] = 3.7;
    gpatable['b+'] = 3.3;
    gpatable['b'] = 3.0;
    gpatable['b-'] = 2.7;
    gpatable['c+'] = 2.3;
    gpatable['c'] = 2.0;
    gpatable['c-'] = 1.7;
    gpatable['d+'] = 1.3;
    gpatable['d'] = 1.0;
    gpatable['d-'] = 0.7;
    gpatable['f'] = 0.0;

    //grades that count toward passed hours
    validPassed = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'p'];
    validGPAgrades = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'f'];//also counts as quality point grades
    validAttempted = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'p', 'nc', 'np', 'i','u','f','*'];

    var termpoints = 0;
    var termpassed = 0;
    var termattempted = 0;
    var gpacredits = 0;
    $('#sap-courses table').find('.gpaterm').text("Your projected GPA for this term is ");
    $('#sap-courses table').find('tr:gt(0)').each(function(){
        repeated = $(this).find('td:nth-child(2) input').is(':checked');
        usergrade = $(this).find('td:nth-child(3) input').val().toLowerCase();
        usercredits = $(this).find('td:nth-child(4) input').val();
        //Make sure the row validates
        if(usergrade !== '' && usercredits !== '' && parseFloat(usercredits) == usercredits && $.inArray(usergrade, validAttempted) >= 0 && parseFloat(usercredits)>0){
            //set this to a white row
            $(this).css("background-color","white");
            lettergrade = gpatable[usergrade];
            credits = parseFloat(usercredits);
            //if that grade counts as a passed grade, let's add it to our projected passed hours
            if($.inArray(usergrade, validPassed) >= 0 && !repeated){
                termpassed += credits;
            }
            if($.inArray(usergrade, validAttempted) >= 0){
                termattempted += credits;   
            }
            if($.inArray(usergrade, validGPAgrades) >= 0){
                termpoints += lettergrade * credits;
                gpacredits += credits;
            }
        }
        else{
            empty = true;
            $(this).find('input:gt(1)').each(function(){
                if($(this).val() !== ''){
                    empty = false;
                }
            });
            if(!empty){
                $(this).css("background-color","#fc6666");
            }
        }

        avg = termpoints / gpacredits;
        if(termattempted > 0){
            $('#sap-courses .completionterm').text("Your projected completion rate for this term is " + ((termpassed / termattempted) * 100).toFixed(2) + "%");
        }
        else
            $('#sap-courses .completionterm').text("Your projected completion rate for this term is ");
        if(gpacredits >0){
            $('#sap-courses .gpaterm').text("Your projected GPA for this term is " + avg.toFixed(2));
        }
        else
            $('#sap-courses .gpaterm').text("Your projected GPA for this term is ");
    });
    if(termattempted + termpassed > 0){
        if((((termpassed / termattempted) * 100).toFixed(2) < 66.666666) || avg.toFixed(2) < 2){
            statusmessage = "will not";
            newclass = 'bad';
        }
        else{
            statusmessage = "will";
            newclass = 'good';
        }
        $('#standing').html("Based on your projections for the term(s) above, you <strong>" + statusmessage + "</strong> meet APS standards.");
        $('#standing').attr('class',newclass);
    }
}
