//JS for login and register views here
// page init
jQuery(function() {
    initWow();
});

// wow for scroll animations
function initWow() {
    new WOW().init();
}

$(document).ready(function() {
    $('#wrapper').fadeIn(1200);
	$('#riderUserType').change(function() {
        selection = $(this).val();
        switch(selection) {
            case 'true':
                $('#driverForm').show();
                $('#riderForm').hide();
                $('#driverNameField').val($('#riderNameField').val());
                var nameColor = document.getElementById('riderNameField').style.borderColor;
                document.getElementById('driverNameField').style.borderColor = nameColor;
                $('#driverEmailField').val($('#riderEmailField').val());
                var emailColor = document.getElementById('riderEmailField').style.borderColor;
                document.getElementById('driverEmailField').style.borderColor = emailColor;
                $('#driverPasswordField').val($('#riderPasswordField').val());
                var passColor = document.getElementById('riderPasswordField').style.borderColor;
                document.getElementById('driverPasswordField').style.borderColor = passColor;
                $('#driverConfPasswordField').val($('#riderConfPasswordField').val());
                var confPassColor = document.getElementById('riderConfPasswordField').style.borderColor;
                document.getElementById('driverConfPasswordField').style.borderColor = confPassColor;
                var typeColor = document.getElementById('riderUserType').style.borderColor;
                document.getElementById('driverUserType').style.borderColor = typeColor;
                /*$('#driverPasswordField').val('');
                $('#driverConfPasswordField').val('');*/
                $('#driverUserType').val("true");
                break;
            default:
                $('#driverForm').hide();
                break;
        }
    });
    $('#driverUserType').change(function(){
        selection = $(this).val();
        switch(selection) {
            case 'false':
                $('#driverForm').hide();
                $('#riderForm').show();
                $('#riderNameField').val($('#driverNameField').val());
                var nameColor = document.getElementById('driverNameField').style.borderColor;
                document.getElementById('riderNameField').style.borderColor = nameColor;
                $('#riderEmailField').val($('#driverEmailField').val());
                var emailColor = document.getElementById('driverEmailField').style.borderColor;
                document.getElementById('riderEmailField').style.borderColor = emailColor;
                $('#riderPasswordField').val($('#driverPasswordField').val());
                var passColor = document.getElementById('driverPasswordField').style.borderColor;
                document.getElementById('riderPasswordField').style.borderColor = passColor;
                $('#riderConfPasswordField').val($('#driverConfPasswordField').val());
                var confPassColor = document.getElementById('driverConfPasswordField').style.borderColor;
                document.getElementById('riderConfPasswordField').style.borderColor = confPassColor;
                var typeColor = document.getElementById('driverUserType').style.borderColor;
                document.getElementById('riderUserType').style.borderColor = typeColor;
                /*$('#riderPasswordField').val('');
                $('#riderConfPasswordField').val('');*/
                $('#riderUserType').val("false");
                break;
            default:
                $('#riderForm').hide();
                break;
        }
    });
    $('#signupRiderForm').submit(function(e) {
        e.preventDefault();
        if (document.getElementById('riderPasswordField').value == document.getElementById('riderConfPasswordField').value) {
            doRegister();
        } else {
            $("#signupRiderForm").effect("shake");
            $(".signup-error").html("Passwords do not match.");
            $(".signup-error").css('color', '#d50000');
            document.getElementById('riderNameField').style.borderColor = "green";
            document.getElementById('riderEmailField').style.borderColor = "green";
            document.getElementById('riderPasswordField').style.borderColor = "#d50000";
            document.getElementById('riderPasswordField').value = "";
            document.getElementById('riderConfPasswordField').style.borderColor = "#d50000";
            document.getElementById('riderConfPasswordField').value = "";
            document.getElementById('riderUserType').style.borderColor = "green";
        }
    });
    $('#signupDriverForm').submit(function(e) {
        e.preventDefault();
        if (document.getElementById('driverPasswordField').value == document.getElementById('driverConfPasswordField').value) {
            doRegister();
        } else {
            $("#signupDriverForm").effect("shake");
            $(".signup-error").html("Passwords do not match.");
            $(".signup-error").css('color', '#d50000');
            document.getElementById('driverNameField').style.borderColor = "green";
            document.getElementById('driverEmailField').style.borderColor = "green";
            document.getElementById('driverPasswordField').style.borderColor = "#d50000";
            document.getElementById('driverPasswordField').value = "";
            document.getElementById('driverConfPasswordField').style.borderColor = "#d50000";
            document.getElementById('driverConfPasswordField').value = "";
            document.getElementById('driverUserType').style.borderColor = "green";
            document.getElementById('platesField').style.borderColor = "green";
            document.getElementById('color').style.borderColor = "green";
            document.getElementById('year').style.borderColor = "green";
            document.getElementById('make').style.borderColor = "green";
            document.getElementById('insured').style.borderColor = "green";
        }
    });
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        doLogin();
    });
});

function doRegister() {
    var riderVisible = $('#riderForm').is(':visible');
    if (riderVisible == true) {
        var formData = {
            'name': $('#riderNameField').val(),
            'email': $('#riderEmailField').val(),
            'password': $('#riderPasswordField').val(),
            'confirmpassword': $('#riderConfPasswordField').val(),
            'isdriver': $('#riderUserType').val()
        };
    } else {
        var formData = {
            'name': $('#driverNameField').val(),
            'email': $('#driverEmailField').val(),
            'password': $('#driverPasswordField').val(),
            'confirmpassword': $('#driverConfPasswordField').val(),
            'isdriver': $('#driverUserType').val(),
            'licenseplate': $('#platesField').val(),
            'color': $('#color').val(),
            'year': $('#year').val(),
            'make': $('#make').val()
        };
    }
    $.ajax({
        url: '/api/signup',
        method: 'POST',
        data: formData,
        success: function(data, status) {
            console.log(status + " : registered and logged in as " + data);
            if (data.charAt(0) === "/") {
                window.location.href = data;
            } else if (data.charAt(0) === "f") {
                $("#signupRiderForm").effect("shake");
                $(".signup-error").html("That email is taken. Try another.");
                $(".signup-error").css('color', '#d50000');
                document.getElementById('riderNameField').style.borderColor = "green";
                document.getElementById('riderEmailField').style.borderColor = "#d50000";
                document.getElementById('riderEmailField').value = "";
                document.getElementById('riderPasswordField').style.borderColor = "grey";
                document.getElementById('riderPasswordField').value = "";
                document.getElementById('riderConfPasswordField').style.borderColor = "grey";
                document.getElementById('riderConfPasswordField').value = "";
                document.getElementById('riderUserType').style.borderColor = "green";
            } else if (data.charAt(0) === "t") {
                $("#signupDriverForm").effect("shake");
                $(".signup-error").html("That email is taken. Try another.");
                $(".signup-error").css('color', '#d50000');
                document.getElementById('driverNameField').style.borderColor = "green";
                document.getElementById('driverEmailField').style.borderColor = "#d50000";
                document.getElementById('driverEmailField').value = "";
                document.getElementById('driverPasswordField').style.borderColor = "grey";
                document.getElementById('driverPasswordField').value = "";
                document.getElementById('driverConfPasswordField').style.borderColor = "grey";
                document.getElementById('driverConfPasswordField').value = "";
                document.getElementById('driverUserType').style.borderColor = "green";
                document.getElementById('platesField').style.borderColor = "green";
                document.getElementById('color').style.borderColor = "green";
                document.getElementById('year').style.borderColor = "green";
                document.getElementById('make').style.borderColor = "green";
                document.getElementById('insured').style.borderColor = "green";
            }
        }
    });
}

function doLogin() {
    var formData = {
        'email': $('input[name=email]').val(),
        'password': $('input[name=password]').val()
    };
    $.ajax({
        url: '/api/login',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            console.log(status + " : logged in as " + data);
            if (data.charAt(0) === "/") {
                window.location.href = data;
            } else if (data === "Invalid password!") {
                $("#loginForm").effect("shake");
                $("#login-error").html("Wrong password. Try again.");
                $("#login-error").css('color', '#d50000');
                document.getElementById('emailField').style.borderColor = "green";
                document.getElementById('passwordField').style.borderColor = "#d50000";
                document.getElementById('passwordField').value = "";
            } else if (data === "No account with that email was found!") {
                $("#loginForm").effect("shake");
                $("#login-error").html("Couldn't find your uberJR account.");
                $("#login-error").css('color', '#d50000');
                document.getElementById('emailField').style.borderColor = "#d50000";
                document.getElementById('emailField').value = "";
                document.getElementById('passwordField').style.borderColor = "grey";
                document.getElementById('passwordField').value = "";
            } else {
                alert("Unknown error!");
            }
        }
    });
}
