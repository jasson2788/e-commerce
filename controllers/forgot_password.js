DIAMOND.controller.create({
    name: 'forgot_password',
    controller: function () {
        var _variables = {};
        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                var email = _variables.app.get_current_p();
                if (UTILS.isDefined(email) && !_variables.app.module('verify').email_by_value(email)) {
                    document.getElementById('form_forgot_password_text').innerHTML = "Your account has been loocked...";
                    document.getElementById('form_forgot_password_email').value = email;
                    document.getElementById('form_forgot_password_email_btn').disabled = false;
                }
                params.callback();
            },
            blur: function (element, event) {
                document.getElementById("form_forgot_password_email_btn").disabled = _variables.app.module('verify').email({ element: element, e: event }) === 0 ? false : true;
            },
            input: function (element, event) {
                document.getElementById("form_forgot_password_email_btn").disabled = _variables.app.module('verify').email({ element: element, e: event }) === 0 ? false : true;
            },
            submit: function () {
                var email = document.getElementById('form_forgot_password_email'), btn = document.getElementById("form_forgot_password_email_btn"), result = document.getElementById('forgot_password_result');
                if (_variables.app.module('verify').email({ element: email, e: null }) !== 0)
                    return false;

                UTILS.addClass({ element: btn, class: 'keep_color' });
                btn.disabled = true;
                btn.innerHTML = "sending email...";
                result.innerHTML = "";
                _variables.app.module('ajax').call({
                    data: "email=" + email.value,
                    method: 'forgot',
                    callback: function (data) {
                        var txt = "try again";
                        if (data === "OK") {
                            txt = "send email";
                        }

                        setTimeout(function () {
                            result.innerHTML = "A message with your new password was sent to your email. :)";
                            email.blur();
                            email.value = "";

                            UTILS.removeClass({ element: btn, class: 'keep_color' });
                            btn.disabled = data === "OK" ? true : false;
                            btn.innerHTML = txt;
                        }, 300);
                    }
                });

                return false;
            }
        };
    }
});