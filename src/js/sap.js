(function($){
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

    $('#fakebutton').click(function(event){
        event.preventDefault();
        calculate();
    });

    $('#newterm').click(function(event){
        event.preventDefault();
        var newFieldSet = $(this).parent().find('fieldset:last').clone();
        //add plus 1, becuase while you and I start counting at 0, most folks start at 1
        var numFieldSets = $('fieldset').length + 1;
        newFieldSet.find('legend').text('Term ' + numFieldSets);
        newFieldSet.find('tr:gt(4)').remove();
        newFieldSet.find('tr').each(function(){
            $(this).find('input[type="text"]').val('');
            $(this).find('input:first').val('Course Name');
            $(this).find('input:nth-child(2)').removeAttr('checked');
        });

        $(this).parent().find('fieldset:last').after(newFieldSet);
        //note that this is now a new fieldset
        calculate();
    });

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

        if(parseFloat(values['instattemptedhrs']) < parseFloat(values['instpassedhrs'])){
            $('#totalInstError').text("Passed can't be greater than attempted!").show()
            $('#totalInstError').css("background-color","#fc6666");
        }
        else if(parseFloat(values['instattemptedhrs']) != values['instattemptedhrs'] || parseFloat(values['instpassedhrs']) != values['instpassedhrs']){
            $('#totalInstError').text("Make sure you're only using numbers").show();
            $('#totalInstError').css("background-color","#fc6666");
        }
        else{
            $('#totalInstError').hide();
            $('#totalInstError').css("background-color","white");
        }
        if(parseFloat(values['transattemptedhrs']) < parseFloat(values['transpassedhrs'])){
            $('#totalTransError').text("Passed can't be greater than attempted!").show();
            $('#totalTransError').css("background-color","#fc6666");
        }
        else if(parseFloat(values['transattemptedhrs']) != values['transattemptedhrs'] || parseFloat(values['transpassedhrs']) != values['transpassedhrs']){
            $('#totalTransError').text("Make sure you're only using numbers").show();
            $('#totalTransError').css("background-color","#fc6666");
        }
        else{
            $('#totalTransError').hide();
            $('#totalTransError').css("background-color","white");
        }

        totalattempted = parseFloat(values['instattemptedhrs']) + parseFloat(values['transattemptedhrs']);
        totalpassed = parseFloat(values['instpassedhrs']) + parseFloat(values['transpassedhrs']);
        instgpahours = parseFloat(values['instgpahrs']);
        qualpoints = parseFloat(values['instqualpoints']);

        $('#totalAttempted').text(totalattempted);
        $('#totalPassed').text(totalpassed);
        if(qualpoints > 0 && instgpahours > 0){
            $('#curGPA').html("<strong>Current Cumulative GPA:</strong> " + (qualpoints / instgpahours).toFixed(3));
        }

        //grades that count toward passed hours
        validPassed = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'p'];
        validGPAgrades = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'f'];//also counts as quality point grades
        validAttempted = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'p', 'nc', 'np', 'i','u','f','*'];
        projectedPassed = totalpassed;
        projectedAttempted = totalattempted;
        projectedPoints = 0;
        projectedGPAHours = 0;

        //loop through rows of each term, adding (grade, credits, and computing points)
        i = 0;
        $('#sap-courses fieldset').each(function(){
            var termpoints = 0;
            var termpassed = 0;
            var termattempted = 0;
            var gpacredits = 0;
            $(this).find('.gpaterm').text("Your projected GPA for this term is ");
            $(this).find('tr:gt(0)').each(function(){
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
                    i++;
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
            });
            projectedPassed += termpassed;
            projectedAttempted += termattempted;
            projectedPoints += termpoints;
            projectedGPAHours += gpacredits;
            avg = termpoints / gpacredits;
            if(termattempted > 0){
                $(this).find('.completionterm').text("Your projected Completion Rate for this term is " + ((termpassed / termattempted) * 100).toFixed(2) + "%");
            }
            else
                $(this).find('.completionterm').text("Your projected Completion Rate for this term is ");
            if(gpacredits >0){
                $(this).find('.gpaterm').text("Your projected GPA for this term is " + avg.toFixed(2));
            }
            else
                $(this).find('.gpaterm').text("Your projected GPA for this term is ");
        });
        if(i + totalattempted + totalpassed > 0){
            //figure out Projected Atttempted Hours
            $('#resultTotalAttempted').text(projectedAttempted);
            //figure out Projected Passed Hours
            $('#resultTotalPassed').text(projectedPassed);
            //display projected completion rate
            finalcompletionrate = (projectedPassed / projectedAttempted) * 100;
            $('#resultCompletionRate').text(finalcompletionrate.toFixed(2) + "%");
            if((projectedGPAHours + instgpahours) > 0){
                finalgpa = (projectedPoints + qualpoints) / (projectedGPAHours + instgpahours);
                $('#resultNewGPA').text(finalgpa.toFixed(3));
            }
            if(projectedAttempted < 17){
                if(finalcompletionrate >= 67.0){
                    statusmessage = "will";
                    newclass = 'good';
                }
                else{
                    statusmessage = "will not";
                    newclass = 'bad';
                }
            }
            else{
                if(finalcompletionrate < 67.0 || finalgpa < 2.0){
                    statusmessage = "will not";
                    newclass = 'bad';
                }
                else{
                    statusmessage = "will";
                    newclass = 'good';
                }
            }
            $('#standing').html("Based on your projections for the term(s) above, you <strong>" + statusmessage + "</strong> meet financial aid SAP standards.");
            $('#standing').attr('class',newclass);
        }
    }
})(jQuery);