let sapContainer = document.querySelector(".sap-courses");
sapContainer.addEventListener('click', function(event){
    if (event.target.classList.contains('addCourse')){
        event.preventDefault();
        let newRow = event.target.parentNode.querySelector('tbody tr:last-child').cloneNode(true);
        newRow.querySelector('td:first-child input').value = 'Course Name';
        newRow.querySelector('td:nth-child(2) input').checked = false;
        newRow.querySelector('td:nth-child(3) input').value = '';
        newRow.querySelector('td:nth-child(4) input').value = '';
        event.target.parentNode.querySelector('tbody tr:last-child').after(newRow);
    }
    if (event.target.classList.contains('delete-button')){
        event.preventDefault();
        event.target.parentNode.parentNode.parentNode.remove();
        calculate();
    }
});

// Continuously updates page as user inputs new data
let sapInputs = document.querySelectorAll('.sap-form input');
sapInputs.forEach(sapInput => sapInput.addEventListener('keyup', function(event){
    event.preventDefault();
    calculate();
}));

// Continuously updates page as user selects checkboxes
let sapCheckbox = document.querySelectorAll('.sap-form input[type="checkbox"');
sapCheckbox.forEach(check => check.addEventListener('click', function(){
    calculate();
}));

// Placeholder button
document.getElementById("fakebutton").addEventListener("click", function(event){
    event.preventDefault();
    calculate();
});

document.getElementById('newterm').addEventListener('click', function(event){
    event.preventDefault();
    let newFieldSet = document.querySelectorAll('fieldset');
    let clonedFieldSet = newFieldSet[newFieldSet.length -1].cloneNode(true);
    //add plus 1, because while you and I start counting at 0, most folks start at 1
    let numFieldSets = document.querySelectorAll('fieldset').length + 1;
    clonedFieldSet.querySelector('fieldset legend').innerHTML = 'Term ' + numFieldSets;
    if(clonedFieldSet.contains(clonedFieldSet.querySelector('fieldset tbody tr:nth-child(n+5)'))){
        clonedFieldSet.querySelector('fieldset tbody tr:nth-child(n+5)').remove();
    };
    newFieldSet[newFieldSet.length -1].after(clonedFieldSet);

});

function calculate(){
    let values = {};
    let values2 = document.querySelectorAll('.sap-form input[type="text"]');
    values2.forEach(v => values[v.name] = v.value);

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
        document.getElementsByClassName('totalInstError')[0].innerHTML = "Passed can't be greater than attempted!";
        document.getElementsByClassName('totalInstError')[0].style.display = "block";
    }
    else if(parseFloat(values['instattemptedhrs']) != values['instattemptedhrs'] || parseFloat(values['instpassedhrs']) != values['instpassedhrs']){
        document.getElementsByClassName('totalInstError')[0].innerHTML = "Make sure you're only using numbers";
        document.getElementsByClassName('totalInstError')[0].style.display = "block";
    }
    else{
        document.getElementsByClassName('totalInstError')[0].style.display = "none";
    }
    if(parseFloat(values['transattemptedhrs']) < parseFloat(values['transpassedhrs'])){
        document.getElementsByClassName('totalTransError')[0].innerHTML = "Passed can't be greater than attempted!";
        document.getElementsByClassName('totalTransError')[0].style.display = "block";
    }
    else if(parseFloat(values['transattemptedhrs']) != values['transattemptedhrs'] || parseFloat(values['transpassedhrs']) != values['transpassedhrs']){
        document.getElementsByClassName('totalTransError')[0].innerHTML = "Make sure you're only using numbers";
        document.getElementsByClassName('totalTransError')[0].style.display = "block";
    }
    else{
        document.getElementsByClassName('totalTransError')[0].style.display = "none";
    }

    totalAttempted = parseFloat(values['instattemptedhrs']) + parseFloat(values['transattemptedhrs']);
    totalPassed = parseFloat(values['instpassedhrs']) + parseFloat(values['transpassedhrs']);
    instgpahours = parseFloat(values['instgpahrs']);
    qualPoints = parseFloat(values['instqualpoints']);

    document.getElementsByClassName('totalAttempted')[0].innerHTML = totalAttempted;
    document.getElementsByClassName('totalPassed')[0].innerHTML = totalPassed;   
    if(qualPoints > 0 && instgpahours > 0){
        document.getElementsByClassName('curGPA')[0].innerHTML = "<strong>Current Cumulative GPA:</strong>" + (qualpoints / instgpahours).toFixed(3);
    }

    //grades that count toward passed hours
    validPassed = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'p'];
    validGPAgrades = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'f'];//also counts as quality point grades
    validAttempted = ['a', 'b', 'c', 'd', 'a+', 'b+', 'c+', 'd+','a-', 'b-', 'c-', 'd-', 'p', 'nc', 'np', 'i', 'u', 'f', '*', 'w'];
    projectedPassed = totalPassed;
    projectedAttempted = totalAttempted;
    projectedPoints = 0;
    projectedGPAHours = 0;

    
    //loop through rows of each term, adding (grade, credits, and computing points)
    i = 0;
    $('.sap-courses fieldset').each(function(){
        var termPoints = 0;
        var termPassed = 0;
        var termAttempted = 0;
        var gpaCredits = 0;
        document.getElementsByClassName('gpaterm')[0].innerHTML = "Your projected GPA for this term is ";
        $(this).find('tr:gt(0)').each(function(){
            repeated = $(this).find('td:nth-child(2) input').is(':checked');
            userGrade = $(this).find('td:nth-child(3) input').val().toLowerCase();
            userCredits = $(this).find('td:nth-child(4) input').val();
            //Make sure the row validates
            if(userGrade !== '' && userCredits !== '' && parseFloat(userCredits) == userCredits && $.inArray(userGrade, validAttempted) >= 0 && parseFloat(userCredits)>0){
                //set this to a white row
                $(this).css("background-color","white");
                letterGrade = gpatable[userGrade];
                credits = parseFloat(userCredits);
                //if that grade counts as a passed grade, let's add it to our projected passed hours
                if($.inArray(userGrade, validPassed) >= 0 && !repeated){
                    termPassed += credits;
                }
                if($.inArray(userGrade, validAttempted) >= 0){
                    termAttempted += credits;   
                }
                if($.inArray(userGrade, validGPAgrades) >= 0){
                    termPoints += letterGrade * credits;
                    gpaCredits += credits;
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
        projectedPassed += termPassed;
        projectedAttempted += termAttempted;
        projectedPoints += termPoints;
        projectedGPAHours += gpaCredits;
        avg = termPoints / gpaCredits;
        if(termAttempted > 0){
            document.getElementsByClassName('completionterm')[0].innerHTML = "Your projected completion rate for this term is " + ((termPassed / termAttempted) * 100).toFixed(2) + "%"
        }
        else
            document.getElementsByClassName('completionterm')[0].innerHTML = "Your projected completion rate for this term is ";
        if(gpaCredits >0){
            document.getElementsByClassName('gpaterm')[0].innerHTML = "Your projected GPA for this term is " + avg.toFixed(2);
        }
        else
            document.getElementsByClassName('gpaterm')[0].innerHTML = "Your projected GPA for this term is ";
    });
    
    if(i + totalAttempted + totalPassed > 0){
        //figure out Projected Attempted Hours
        document.getElementsByClassName('resultTotalAttempted')[0].innerHTML = projectedAttempted;
        //figure out Projected Passed Hours
        document.getElementsByClassName('resultTotalPassed')[0].innerHTML = projectedPassed;
        //display projected completion rate
        finalCompletionRate = (projectedPassed / projectedAttempted) * 100;
        document.getElementsByClassName('resultCompletionRate')[0].innerHTML = finalCompletionRate.toFixed(2) + "%";
        if((projectedGPAHours + instgpahours) > 0){
            finalgpa = (projectedPoints + qualPoints) / (projectedGPAHours + instgpahours);
            document.getElementsByClassName('resultNewGPA')[0].innerHTML = finalgpa.toFixed(3);
        }
        if(projectedAttempted < 17){
            if(finalCompletionRate >= 67.0){
                statusMessage = "will";
                newClass = 'good';
                oldClass  = 'bad';
            }
            else{
                statusMessage = "will not";
                newClass = 'bad';
                oldClass = 'good';
            }
        }
        else{
            if(finalCompletionRate < 67.0 || finalgpa < 2.0){
                statusMessage = "will not";
                newClass = 'bad';
                oldClass = 'good';
            }
            else{
                statusMessage = "will";
                newClass = 'good';
                oldClass = 'bad';
            }
        }
        document.getElementsByClassName('standing')[0].innerHTML = "Based on your projections for the term(s) above, you <strong>" + statusMessage + "</strong> meet financial aid SAP standards.";
        document.getElementsByClassName('standing')[0].classList.remove(oldClass);
        document.getElementsByClassName('standing')[0].classList.add(newClass);
    }
}
