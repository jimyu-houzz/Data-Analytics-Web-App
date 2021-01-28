//Hide login form and show registration form
function register(){
  document.getElementById("registrationform").style.display = "block";
  document.getElementById("loginform").style.display = "none";
}

//Hide registration form and show login form
function login(){
  document.getElementById("registrationform").style.display = "none";
  document.getElementById("loginform").style.display = "block";
}


//function to determine if a field is blank
function isBlank(inputField){
  if(inputField.type=="checkbox"){
	   if(inputField.checked){return false;}
	    return true;
    }
    if (inputField.value==""){return true;}
  return false;
}

//Validate Email
function validateEmail(emailId){
  const email = document.getElementById(emailId);
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  
  return email.value.match(emailRegex);
}

//Validate for strong password: must have at least 8 characters, contain at least 1 upper and 1 lower case letter and 1 number
function validatePassword(){
  var password = document.getElementById("password");
  var pwRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  
  return password.value.match(pwRegex);
}

//check if password match
function passwordMatch(){
  const password = document.getElementById("password");
  const repassword = document.getElementById("repassword");
  
  return password.value === repassword.value;
}

// check if name contains special character
function checkName(){
  const firstName = document.getElementById("firstname");
  const lastName = document.getElementById("lastname");
  // letter only and should be between 2-30 characters
  const letterOnlyReg = /^[a-zA-Z ]{2,30}$/;
  if(!firstName.value.match(letterOnlyReg)) {
    errorresult.innerHTML = "Invalid First name. First Name must not contain any special character or number and should be from 2-30 characters.";
    return false;
  } else if(!lastName.value.match(letterOnlyReg)) {
    errorresult.innerHTML = "Invalid Last name. Last Name must not contain any special character or number and should be from 2-30 characters.";
    return false;
  } else {
    return true;
  }
}

//Check all validations
function runValidation(){
  if(!validateEmail("email")){
    errorresult.innerHTML = "Invalid email. Please input email in the correct format.";
    return false;
  }
  else if(!validatePassword()){
    errorresult.innerHTML = "Password is not strong enough. Password must be 8 characters or longer, and must contain at least 1 uppercase letter, 1 lowercase letter, 1 numeric character, and 1 special character.";
    //alert("Password is not strong enough. Password must be 8 characters or longer, and must contain at least 1 uppercase letter, 1 lowercase letter, 1 numeric character, and 1 special character.");
    return false;
  }
  else if(!passwordMatch()){
    errorresult.innerHTML = "Password does not match. Plese input the password again.";
    return false;
  }
  else if(!checkName()){
    return false;
  }
  else{
    return true;
  }
}

$(document).ready(function(){
  var loginform = document.getElementById("loginform");
  var loginRequiredInputs = document.querySelectorAll(".loginrequired");
  var registrationform = document.getElementById("registrationform");
  var requiredInputs = document.querySelectorAll(".required");

  //When login form is submitted
  loginform.onsubmit = function(e){
    console.log("Login submitted on frontend");
    for (let input of loginRequiredInputs){
      if(input.value === ""){
        e.preventDefault();
        loginerrorresult.innerHTML = "Please input all the required fields";
        return;
      }
    }
    if(!validateEmail("loginemail")){
      e.preventDefault();
      loginerrorresult.innerHTML = "Invalid email. Please input email in the correct format.";
      return false;
    }
    loginerrorresult.innerHTML = "";
    //loginerrorresult.style.color = "#4e9947";
    console.log("pass!");
  }

  //When registration form is submitted
  registrationform.onsubmit = function(e){
    //var requiredInputs = document.querySelectorAll(".required");
    for (let i=0; i<requiredInputs.length; i++){
      if(isBlank(requiredInputs[i])){
        e.preventDefault();
        errorresult.innerHTML = "Please input all the required fields";
      //if not pass validation
      } else if(!runValidation()){
        e.preventDefault();
      } else{
        errorresult.innerHTML = "";
        //errorresult.style.color = "#4e9947";
        console.log("pass!");
	    }
    }
  }
});
