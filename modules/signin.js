DIAMOND.module.create({
    name: 'singin',
    module: function () {
        return {
            sing_in_event: function () {
                var disabled = document.getElementById('form_sign_in_email').value.length > 0 && document.getElementById('form_sign_in_password').value.length > 0;
                document.getElementById('form_sign_in_btn').disabled = disabled ? false : true;
            },
            sing_in_submit: function (page) {
                var email = document.getElementById('form_sign_in_email').value, pass = document.getElementById('form_sign_in_password').value, btn = document.getElementById('form_sign_in_btn');
                if (!(email.length > 0 && pass.length > 0))
                    return false;

                UTILS.addClass({ element: btn, class: 'keep_color' });
                btn.disabled = true;
                btn.innerHTML = "signing in...";
                DIAMOND.core.app().module('ajax').verify({
                    name: email, pass: pass, uuid: DIAMOND.core.app().module('locked').identify(),
                    callback: function (data) {
                        DIAMOND.core.app().module('roles').roles(JSON.stringify(data));
                        DIAMOND.core.app().module('view').change_view({ view: page });
                    },
                    error_callback: function (data) {
                        if (data.code === 401) {
                            DIAMOND.core.app().module('view').change_view({ view: 'forgot_password', replace: true, p: email });
                            return;
                        }

                        setTimeout(function () {
                            UTILS.removeClass({ element: btn, class: 'keep_color' });
                            btn.disabled = false;
                            btn.innerHTML = "try again";
                        }, 300);
                    }
                });
                return false;
            }
        };
    }
});