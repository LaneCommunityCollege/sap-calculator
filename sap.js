jQuery(document).ready(function(){
    //Some functions for our table buttons:
    jQuery('.newrow').live('click', function(event){
        event.preventDefault();
        var newRow = jQuery(this).parent().find('tr:last').clone();
        newRow.find('input:first').val('Course Name');
        jQuery(this).parent().find('tr:last').after(newRow);
    });

    jQuery('#fakebutton').click(function(event){
        event.preventDefault();
        calculate();
    });

    jQuery('#newterm').click(function(event){
        event.preventDefault();
        var newFieldSet = jQuery(this).parent().find('fieldset:last').clone();
        //get the number of fieldsets
        var numFieldSets = jQuery('fieldset').length + 1; //add plus 1, becuase only CS dorks care about things starting at 0
        newFieldSet.find('legend').text('Term ' + numFieldSets);
        newFieldSet.find('tr:gt(4)').remove();
        newFieldSet.find('tr').each(function(){
            jQuery(this).find('input[type="text"]').val('');
            jQuery(this).find('input:first').val('Course Name');
            jQuery(this).find('input:nth-child(2)').removeAttr('checked');
        });

        jQuery(this).parent().find('fieldset:last').after(newFieldSet);
        //note that this is now a new fieldset
        calculate();
    });

    jQuery('.delete-button').live('click', function(event){
        event.preventDefault();
        jQuery(this).parents('tr').remove();
        calculate();
    });

    jQuery('#sapform input').live('keyup', function(){ calculate()});

    jQuery('#sapform input[type="checkbox"]').live('click', function(){ calculate()});

    function calculate(){
        // get an associative array of just the values.
        var values = {};
        jQuery('#sapform :input').each(function() {
            values[this.name] = jQuery(this).val().toLowerCase();
        });
        
        var gpatable = {}
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
            jQuery('#totalInstError').text("Passed can't be greater than attempted!").show()
            jQuery('#totalInstError').css("background-color","#fc6666");
        }
        else if(parseFloat(values['instattemptedhrs']) != values['instattemptedhrs'] || parseFloat(values['instpassedhrs']) != values['instpassedhrs']){
            jQuery('#totalInstError').text("Make sure you're only using numbers").show();
            jQuery('#totalInstError').css("background-color","#fc6666")
        }
        else{
            jQuery('#totalInstError').hide();
            jQuery('#totalInstError').css("background-color","white")
        }
        if(parseFloat(values['transattemptedhrs']) < parseFloat(values['transpassedhrs'])){
            jQuery('#totalTransError').text("Passed can't be greater than attempted!").show();
            jQuery('#totalTransError').css("background-color","#fc6666")
        }
        else if(parseFloat(values['transattemptedhrs']) != values['transattemptedhrs'] || parseFloat(values['transpassedhrs']) != values['transpassedhrs']){
            jQuery('#totalTransError').text("Make sure you're only using numbers").show();
            jQuery('#totalTransError').css("background-color","#fc6666")
        }
        else{
            jQuery('#totalTransError').hide();
            jQuery('#totalTransError').css("background-color","white")
        }

        totalattempted = parseFloat(values['instattemptedhrs']) + parseFloat(values['transattemptedhrs']);
        totalpassed = parseFloat(values['instpassedhrs']) + parseFloat(values['transpassedhrs']);
        instgpahours = parseFloat(values['instgpahrs']);
        qualpoints = parseFloat(values['instqualpoints']);

        jQuery('#totalAttempted').text(totalattempted);
        jQuery('#totalPassed').text(totalpassed);
        if(qualpoints > 0 && instgpahours > 0){
            jQuery('#curGPA').html("<strong>Current Cumulative GPA:</strong> " + (qualpoints / instgpahours).toFixed(3));
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
        jQuery('#courses fieldset').each(function(){
            var termpoints = 0;
            var termpassed = 0;
            var termattempted = 0;
            var gpacredits = 0;
            jQuery(this).find('.gpaterm').text("Your projected GPA for this term is ");
            jQuery(this).find('tr:gt(0)').each(function(){
                repeated = jQuery(this).find('td:nth-child(2) input').is(':checked');
                usergrade = jQuery(this).find('td:nth-child(3) input').val().toLowerCase();
                usercredits = jQuery(this).find('td:nth-child(4) input').val();
                //Make sure the row validates
                if(usergrade != '' && usercredits != '' && parseFloat(usercredits) == usercredits && jQuery.inArray(usergrade, validAttempted) >= 0 && parseFloat(usercredits)>0){
                    //set this to a white row
                    jQuery(this).css("background-color","white");
                    lettergrade = gpatable[usergrade];
                    credits = parseFloat(usercredits);
                    //if that grade counts as a passed grade, let's add it to our projected passed hours
                    if(jQuery.inArray(usergrade, validPassed) >= 0 && !repeated){
                        termpassed += credits;
                    }
                    if(jQuery.inArray(usergrade, validAttempted) >= 0){
                        termattempted += credits;   
                    }
                    if(jQuery.inArray(usergrade, validGPAgrades) >= 0){
                        termpoints += lettergrade * credits;
                        gpacredits += credits;
                    }
                    i++;
                }
                else{
                    empty = true;
                    jQuery(this).find('input:gt(1)').each(function(){
                        if(jQuery(this).val() != ''){
                            empty = false;
                        }
                    });
                    if(!empty){
                        jQuery(this).css("background-color","#fc6666");
                    }
                }
            });
            projectedPassed += termpassed;
            projectedAttempted += termattempted;
            projectedPoints += termpoints;
            projectedGPAHours += gpacredits;
            avg = termpoints / gpacredits;
            if(termattempted > 0){
                jQuery(this).find('.completionterm').text("Your projected Completion Rate for this term is " + ((termpassed / termattempted) * 100).toFixed(2) + "%");
            }
            else
                jQuery(this).find('.completionterm').text("Your projected Completion Rate for this term is ");
            if(gpacredits >0){
                jQuery(this).find('.gpaterm').text("Your projected GPA for this term is " + avg.toFixed(2));
            }
            else
                jQuery(this).find('.gpaterm').text("Your projected GPA for this term is ");
        });
        if(i + totalattempted + totalpassed > 0){
            //figure out Projected Atttempted Hours
            jQuery('#resultTotalAttempted').text(projectedAttempted);
            //figure out Projected Passed Hours
            jQuery('#resultTotalPassed').text(projectedPassed);
            //display projected completion rate
            finalcompletionrate = (projectedPassed / projectedAttempted) * 100;
            jQuery('#resultCompletionRate').text(finalcompletionrate.toFixed(2) + "%");
            if((projectedGPAHours + instgpahours) > 0){
                finalgpa = (projectedPoints + qualpoints) / (projectedGPAHours + instgpahours);
                jQuery('#resultNewGPA').text(finalgpa.toFixed(3));
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
            jQuery('#standing').html("Based on your projections for the term(s) above, you <strong>" + statusmessage + "</strong> meet financial aid SAP standards.");
            jQuery('#standing').attr('class',newclass);
        }
    }
});