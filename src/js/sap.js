
document.addEventListener("DOMContentLoaded", function () {
  function getVal(id) {
    return parseFloat(document.getElementById(id).value) || 0;
  }

  function calculateInstitutionalAndTransfer() {
    var attemptedInst = getVal("instattemptedhrs");
    var passedInst = getVal("instpassedhrs");
    var gpaInst = getVal("instgpahrs");
    var qualPointsInst = getVal("instqualpoints");

    var attemptedTrans = getVal("transattemptedhrs");
    var passedTrans = getVal("transpassedhrs");

    var totalAttempted = attemptedInst + attemptedTrans;
    var totalPassed = passedInst + passedTrans;

    document.getElementById("totalAttempted").textContent = totalAttempted;
    document.getElementById("totalPassed").textContent = totalPassed;

    var cumulativeGPA = gpaInst === 0 ? 0 : (qualPointsInst / gpaInst).toFixed(2);
    document.getElementById("curGPA").innerHTML =
      "<strong>Current Cumulative GPA:</strong> " + cumulativeGPA;
  }

  function updateTermData() {
    var totalQualityPoints = 0;
    var totalCredits = 0;
    var passedCredits = 0;
    var attemptedCredits = 0;

    document.querySelectorAll("#sap-courses fieldset").forEach(function(fieldset) {
      var rows = fieldset.querySelectorAll("table tbody tr");
      var termQPoints = 0;
      var termCredits = 0;
      var termPassed = 0;
      var termAttempted = 0;

      rows.forEach(function (row) {
        var inputs = row.querySelectorAll("input");
        var grade = inputs[2].value.toUpperCase().trim();
        var credits = parseFloat(inputs[3].value) || 0;

        var gradePoints = {
          A: 4.0, A_MINUS: 3.7, B_PLUS: 3.3, B: 3.0, B_MINUS: 2.7,
          C_PLUS: 2.3, C: 2.0, C_MINUS: 1.7, D_PLUS: 1.3, D: 1.0, D_MINUS: 0.7,
          F: 0.0, P: null, NP: null, W: null, I: null, AU: null
        };

        var normalizedGrade = grade.replace("+", "_PLUS").replace("-", "_MINUS");

        if (gradePoints.hasOwnProperty(normalizedGrade)) {
          var point = gradePoints[normalizedGrade];
          if (point !== null) {
            termQPoints += point * credits;
            termCredits += credits;
          }

          if (["A", "B", "C", "D", "P"].some(function (g) { return grade.startsWith(g); })) {
            termPassed += credits;
          }
          termAttempted += credits;
        }
      });

      totalQualityPoints += termQPoints;
      totalCredits += termCredits;
      passedCredits += termPassed;
      attemptedCredits += termAttempted;

      var termGPA = termCredits ? (termQPoints / termCredits).toFixed(2) : "0.00";
      var completionRate = termAttempted
        ? ((termPassed / termAttempted) * 100).toFixed(1) + "%"
        : "0%";

      var gpaDisplay = fieldset.querySelector(".gpaterm");
      var completionDisplay = fieldset.querySelector(".completionterm");

      if (gpaDisplay) {
        gpaDisplay.textContent = "Your projected GPA for this term is: " + termGPA;
      }
      if (completionDisplay) {
        completionDisplay.textContent = "Your projected completion rate for this term is: " + completionRate;
      }
    });

    var instAttempted = getVal("instattemptedhrs");
    var instPassed = getVal("instpassedhrs");
    var instGPAHrs = getVal("instgpahrs");
    var instQualPts = getVal("instqualpoints");
    var transAttempted = getVal("transattemptedhrs");
    var transPassed = getVal("transpassedhrs");

    var newAttempted = attemptedCredits + instAttempted + transAttempted;
    var newPassed = passedCredits + instPassed + transPassed;
    var newQualPts = totalQualityPoints + instQualPts;
    var newGPAHrs = totalCredits + instGPAHrs;

    document.getElementById("resultTotalAttempted").textContent = newAttempted;
    document.getElementById("resultTotalPassed").textContent = newPassed;
    document.getElementById("resultCompletionRate").textContent =
      newAttempted ? ((newPassed / newAttempted) * 100).toFixed(1) + "%" : "0%";
    document.getElementById("resultNewGPA").textContent =
      newGPAHrs ? (newQualPts / newGPAHrs).toFixed(2) : "0.00";

    var standingElem = document.getElementById("standing");
    standingElem.classList.remove("good", "bad");

    var standingMessage = "";
    if (newAttempted >= 1) {
      var meetsCompletion = (newPassed / newAttempted) * 100 >= 67;
      var meetsGPA = newAttempted < 17 || (newQualPts / newGPAHrs) >= 2.0;

      var meetsSAP = meetsCompletion && meetsGPA;
      var statusText = meetsSAP ? "will meet" : "will not meet";

      standingMessage =
        "Based on your projections for the term(s) above, you <strong>" + statusText + "</strong> financial aid SAP standards.";

      standingElem.classList.add(meetsSAP ? "good" : "bad");
    }

    standingElem.innerHTML = standingMessage;
  }

  function triggerAllCalculations() {
    calculateInstitutionalAndTransfer();
    updateTermData();
  }

  function bindRowEvents(row) {
    var deleteBtn = row.querySelector(".delete-button");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function (e) {
        e.preventDefault();
        row.remove();
        triggerAllCalculations();
      });
    }
    row.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", triggerAllCalculations);
    });
  }

  function bindNewRowButton(button, fieldset) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      var tbody = fieldset.querySelector("table tbody");
      var templateRow = tbody.querySelector("tr");
      if (!templateRow) return;

      var clone = templateRow.cloneNode(true);
      clone.querySelectorAll("input").forEach(function (input) {
        if (input.type === "text") input.value = "";
        if (input.type === "checkbox") input.checked = false;
      });

      bindRowEvents(clone);
      tbody.appendChild(clone);
      triggerAllCalculations();
    });
  }

  function setupFieldset(fieldset) {
    fieldset.querySelectorAll("tr").forEach(bindRowEvents);
    var newRowBtn = fieldset.querySelector(".newrow");
    if (newRowBtn) bindNewRowButton(newRowBtn, fieldset);
  }

  document.querySelectorAll("#sap-courses fieldset").forEach(setupFieldset);

  document.getElementById("newterm").addEventListener("click", function (e) {
    e.preventDefault();

    var firstFieldset = document.querySelector("#sap-courses fieldset");
    if (!firstFieldset) return;

    var newFieldset = firstFieldset.cloneNode(true);

    newFieldset.querySelectorAll("input").forEach(function (input) {
      if (input.type === "text") input.value = "";
      if (input.type === "checkbox") input.checked = false;
    });

    setupFieldset(newFieldset);
    
    // Update the fieldset legend to indicate the term number
    var termCount = document.querySelectorAll("#sap-courses fieldset").length + 1;
    var legend = newFieldset.querySelector("legend");
    if (legend) {
      legend.textContent = "Term " + termCount;
    }
    
    var sapCourses = document.getElementById("sap-courses");
    var lastFieldset = sapCourses.querySelector("fieldset:last-of-type");
    if (lastFieldset && lastFieldset.nextSibling) {
      sapCourses.insertBefore(newFieldset, lastFieldset.nextSibling);
    } else {
      sapCourses.appendChild(newFieldset);
    }


    triggerAllCalculations();
  });

  document.getElementById("fakebutton").addEventListener("click", function (e) {
    e.preventDefault();
    triggerAllCalculations();
  });

  ["totalInstError", "totalTransError", "curGPA", "resultTotalAttempted", "resultTotalPassed", "resultCompletionRate", "resultNewGPA", "standing"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && !el.hasAttribute("aria-live")) {
      el.setAttribute("aria-live", "polite");
    }
  });

  triggerAllCalculations();
});
