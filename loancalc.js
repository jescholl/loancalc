var lockCount = 0;
Number.prototype.toCash = function() {
  return this.toString().toCash();
}
String.prototype.unFormat = function() {
  return this.replace("$","").replace(",","").replace("%","");
}
String.prototype.toCash = function () {
  var input = Number(this).toString();
  var output;  
  var decimal = 0;
  var negSign = "";
  if (input.substr(0,1) == "-") {
    input = input.substr(1);
    negSign = "-";
  }
  if (input.indexOf(".") != -1) {
    if (input.indexOf("e-") > 0) {
      decimal = input = 0
    }
    else {
      decimal = input.substr(input.indexOf(".")) + "001";
      input = input.substr(0,input.indexOf("."));
    }
  }
  decimal = Math.round(decimal * 1000000000000000000000);
//  decimal = Math.round(decimal * 1000000000);
  decimal = (Math.round(parseInt(decimal.toString().substr(0,3))/10) + "00").substr(0,2);
  //decimal = Math.round(decmal/10)
  //decimal = Math.round((decimal + "00").substr(0,3));

  var len = input.length;
  if (len > 3) {
    output = input.substr(len-3, 3);
    for (var cut = len - 6; cut >= 0; cut -= 3) {
      output = input.substr(cut, 3) + "," + output;
    }
    if (cut < 0 && cut > -3) {
      output = input.substr(0,3+cut) + "," + output;
    }
  }
  else {
    output = (input == "" ? 0 : input);
  }
  return negSign + "$" + output + "." + decimal;
}
function isValid(num) {
  num = num.toString().replace(",","").replace("$","").replace("%","");
  return (num.toString().length > 0 && isFinite(num) ? true : false);
}

function isLocked(inputId) {
  return document.getElementById(inputId).disabled;
}

function lockIt(lockId) {
  inputId = lockId.replace("Lock","");
  img = document.getElementById(lockId);
  locked = img.src.replace("unlocked.ico","locked.ico");
  unlocked = locked.replace("locked.ico","unlocked.ico");
  if (img.src == unlocked) {
    if (lockCount++ >= 3) {
      lockCount--;
      alert("Cannot lock more than 3 fields at a time");
      return 0;
    }
  }
  else {
    lockCount--;
  }
//  locked = (document.getElementById(lockId).src == "locked.ico" ? : 1 : 0);
  obj = document.getElementById(inputId);
  if (isValid(obj.value)) {
    img.src = (img.src == unlocked ? locked : unlocked);
    img.title = (img.src == unlocked ? "Unlocked" : "Locked");
    document.getElementById(inputId).disabled = (img.src == unlocked ? false : true);
  }
  else {
    document.getElementById(inputId).disabled = false;
    img.src = unlocked;
    img.title = "Unlocked";

    if (document.getElementById(inputId).disabled) {
      alert("Cannot lock invalid values");
    }
  }



/*  if (isValid(obj.value) || document.getElementById(inputId).disabled) {
	  alert("got here");
	  document.getElementById(inputId).disabled = (img.src.indexOf("unlocked.ico") != -1 ? true : false);
	  img.src = img.src.replace("unlocked.ico","locked.ico");
  }
  else {
	  alert("got here instead");
    alert("Cannot lock invalid values");
    img.src = img.src.replace("locked.ico", "unlocked.ico");
  }
*/
}
var vars = new Array();
var YRS = 0; //Years
var PPY = 1; //Payments per year
var APR = 2; //APR
var AMT = 3; //Ammount
var PMT = 4; //Payment
var IPP = 5; //Interest Per Period

vars[YRS] = 30;
vars[PPY] = 12;
vars[APR] = .05;
vars[AMT] = 100000;
vars[IPP] = vars[APR]/vars[PPY];
vars[PMT] = vars[AMT]/((1-1/Math.pow(1+vars[IPP],vars[YRS]*vars[PPY]))/vars[IPP]);

function change(changeId) {
//  document.getElementById("AMT").value = (99999.9999999901).toCash();
//return;
  if (changeId == "LOAD") {
    document.getElementById("YRS").value = vars[YRS];
    document.getElementById("PPY").value = vars[PPY];
    document.getElementById("APR").value = vars[APR]*100 + "%";
    document.getElementById("AMT").value = vars[AMT].toCash();
    document.getElementById("PMT").value = vars[PMT].toCash();
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].checked = false;
      inputs[i].disabled = false;
    }
    return true;
  }
  changeObj = document.getElementById(changeId);
  var rawChange = changeObj.value.unFormat();
  if (!isValid(rawChange)) {
    alert("Invalid Entry");
    changeObj.value = rawChange = vars[changeId];
  }

  switch (changeId) {
    case "YRS":
      vars[YRS] = rawChange;
      break;
    case "PPY":
      vars[PPY]= rawChange;
      break;
    case "APR":
      vars[APR] = rawChange/100;
      changeObj.value += "%";
      break;
    case "AMT":
      vars[AMT] = rawChange;
      changeObj.value = vars[AMT].toCash();
      break;
    case "PMT":
      vars[PMT] = rawChange;
      changeObj.value = vars[PMT].toCash();
      break;
  }
  // Solve for Payment
  if (!isLocked("PMT") && changeId != "PMT") {
    vars[IPP] = vars[APR]/vars[PPY];
//    alert("Changing PMT");
    if (vars[IPP] == 0) {
      vars[PMT] = vars[AMT]/(vars[YRS]*vars[PPY])
    }
    else {
      vars[PMT] = vars[AMT]/((1-1/Math.pow(1+vars[IPP],vars[YRS]*vars[PPY]))/vars[IPP]);
    }
    document.getElementById("PMT").value = (isFinite(vars[PMT]) ? vars[PMT].toCash() : "Undefined");
  }

  // Solve for Amount
  else if (!isLocked("AMT") && changeId != "AMT") {
    vars[IPP] = vars[APR]/vars[PPY];
//    alert("Changing AMT");
    if (vars[IPP] == 0) {
      vars[AMT] = vars[PMT] * vars[YRS] * vars[PPY];
    }
    else {
      vars[AMT] = vars[PMT]*((1-1/Math.pow(1+vars[IPP],vars[YRS]*vars[PPY]))/vars[IPP]);
    }
    document.getElementById("AMT").value = (isFinite(vars[AMT]) ? vars[AMT].toCash() : "Undefined");
  }

  // Solve for Years
  else if (!isLocked("YRS") && changeId != "YRS") {
    vars[IPP] = vars[APR]/vars[PPY];
//    alert("Changing YRS");
    vars[YRS] = (Math.log(-1/((vars[AMT]/vars[PMT])*vars[IPP]-1))/Math.log(1+vars[IPP]))/vars[PPY];
    document.getElementById("YRS").value = (isFinite(vars[YRS]) ? Math.round(vars[YRS]*10)/10 : "Undefined");
  }

  // Solve for APR
  else if (!isLocked("APR") && changeId != "APR") {
//    alert("Changing APR");
    var guess = .05/vars[PPY];
    var step = guess/2;
    var lastStep = 0;
    var loopCount = 0;

    var calcAMT = vars[PMT]*((1-1/Math.pow(1+guess,vars[YRS]*vars[PPY]))/guess);

    document.getElementById("log").innerHTML = "";
    while (Math.abs(vars[AMT] - calcAMT) > .0001) {
       if ((calcAMT > vars[AMT] && step < 0) || (calcAMT < vars[AMT] && step > 0)) {
         step = step * -1/2;
       }
       else if (lastStep == step) {
         step = step*2;
       }
       else {
         lastStep = step;
       }
       if (loopCount++ > 100) {
         break;
       }
       guess += step;
       calcAMT = vars[PMT]*((1-1/Math.pow(1+guess,vars[YRS]*vars[PPY]))/guess);
//       document.getElementById("log").innerHTML += "<hr>loopCount = " + loopCount + "<br>vars[AMT] = " + vars[AMT] + "<br>calcAMT = " + calcAMT + "<br>guess = " + guess + "<br>step = " + step + "<br>vars[PPY] = " + vars[PPY] + "<br><br>" + vars.valueOf();
    }
    vars[IPP] = guess;
    vars[APR] = vars[IPP] * vars[PPY];
    document.getElementById("APR").value = (isFinite(vars[APR]) ? Math.round(vars[APR]*10000)/100 + "%" : "Undefined");
  }

  // Solve for Payments/Year
  else if (!isLocked("PPY") && changeId != "PPY") {
//    alert("Changing PPY");
    var guess = 12;
    var step = 1;
    var lastStep = 0;
    var loopCount = 0;

    var calcAMT = vars[PMT]*((1-1/Math.pow(1+vars[APR]/guess,vars[YRS]*guess))/(vars[APR]/guess));

    document.getElementById("log").innerHTML = "";
    while (Math.abs(vars[AMT] - calcAMT) > .0001) {
       if ((calcAMT > vars[AMT] && step > 0) || (calcAMT < vars[AMT] && step < 0)) {
         step = step * -1/2;
       }
       else if (lastStep == step) {
         step = step*2;
       }
       else {
         lastStep = step;
       }
       if (loopCount++ > 100) {
         break;
       }
       guess += step;
       calcAMT = vars[PMT]*((1-1/Math.pow(1+vars[APR]/guess,vars[YRS]*guess))/(vars[APR]/guess));
 //      document.getElementById("log").innerHTML += "<hr>loopCount = " + loopCount + "<br>vars[AMT] = " + vars[AMT] + "<br>calcAMT = " + calcAMT + "<br>guess = " + guess + "<br>step = " + step + "<br>vars[PPY] = " + vars[PPY] + "<br><br>" + vars.valueOf();
    }
    vars[PPY] = guess;
    vars[IPP] = vars[APR] / vars[PPY];
    document.getElementById("PPY").value = (isFinite(vars[PPY]) ? Math.round(vars[PPY]*100)/100 : "Undefined");
  }
  makeTable();
}

function makeTable() {
  if (!document.getElementById("amortize").checked) {
    document.getElementById("table").innerHTML = "";
    return true;
  }
//  var begbal;
  var begbal;
  var interest;
  var principal;
//  var endbal;
  var endbal = vars[AMT];

  var tObj = document.getElementById("table");

  tObj.innerHTML = "<tr><th>Year</th><th>Period</th><th>Beginning Balance</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Ending Balance</th></tr>";
  for (var row = 1; row <= Math.ceil(vars[YRS]*vars[PPY]); row++) {
    tObj.insertRow(row);
    for (var cell = 0; cell <= 6; cell++) {
      tObj.rows[row].insertCell(cell);
    }

    begbal = endbal;
//    begbal = (row == 1 ? vars[AMT] : endbal);
    interest = begbal * vars[IPP];
    principal = vars[PMT] - interest;
    endbal = begbal - principal;

    tObj.rows[row].cells[0].innerHTML = Math.ceil(row/vars[PPY]);
    tObj.rows[row].cells[1].innerHTML = row;
    tObj.rows[row].cells[2].innerHTML = begbal.toCash();
    tObj.rows[row].cells[3].innerHTML = vars[PMT].toCash();
    tObj.rows[row].cells[4].innerHTML = interest.toCash();
    tObj.rows[row].cells[5].innerHTML = principal.toCash();
    tObj.rows[row].cells[6].innerHTML = endbal.toCash();

    tObj.rows[row].className = ((tObj.rows[row].cells[0].innerHTML == tObj.rows[row-1].cells[0].innerHTML ? "" : "YrBorder") + (row % 2 ? "Odd" : "Even"));
//    tObj.rows[row].cells[0].className = "LeftJustify";
//    tObj.rows[row].cells[1].className = "LeftJustify";
//    tObj.rows[row].cells[1].innerHTML = tObj.rows[row].className;
  }
}
