DIAMOND.controller.create({
    name: 'my_account',
    controller: function () {
        var _variables = {
            sign_up: {},
            sign_in: {},
            m: {},
            ids: ["my_account_sign_up_user_first_name", "my_account_sign_up_user_last_name", "my_account_sign_up_user_name", "my_account_sign_up_user_phone_number",
                "my_account_sign_up_user_password", "my_account_sign_up_user_retype_password", "my_account_sign_up_postal_code"],
            modify: ["my_account_sign_up_user_first_name", "my_account_sign_up_user_last_name", "my_account_sign_up_user_name", "my_account_sign_up_user_phone_number",
                "my_account_sign_up_postal_code"],
            pass: ['my_account_modify_password_old_user_password', 'my_account_modify_password_user_password', 'my_account_modify_password_user_retype_password'],
            is_modify: false
        };

        var _methods = {
            verify: function (element, event, no_class) {
                var params = { element: element, e: event };
                switch (element.id) {
                    case "my_account_sign_up_user_first_name":
                        return {
                            error: _variables.app.module('verify').length(params)
                        };
                    case "my_account_sign_up_user_last_name":
                        return {
                            error: _variables.app.module('verify').length(params)
                        };
                    case "my_account_sign_up_user_name":
                        return {
                            error: _variables.app.module('verify').email(params)
                        };
                    case "my_account_sign_up_user_phone_number":
                        return {
                            error: _variables.app.module('verify').phone(params),
                            text: 'Invalid phone format XXX-XXX-XXXX'
                        };
                    case "my_account_sign_up_user_password":
                    case "my_account_modify_password_old_user_password":
                    case "my_account_modify_password_user_password":
                        return {
                            error: _variables.app.module('verify').password(params),
                            text: 'Password must be at least 8 characters have at least 1 uppercase alphabet, 1 lowercase alphabet, 1 number and 1 special character.'
                        };
                    case "my_account_sign_up_user_retype_password":
                    case "my_account_modify_password_user_retype_password":
                        return {
                            error: _variables.app.module('verify').same(params, element.id === 'my_account_sign_up_user_retype_password' ? document.getElementById('my_account_sign_up_user_password') : document.getElementById('my_account_modify_password_user_password')),
                            text: 'Passwords must match'
                        };
                    case "my_account_sign_up_postal_code":
                        var error = UTILS.isDefined(_variables.sign_up) && UTILS.isDefined(_variables.sign_up.user_state) ? 0 : 1;
                        return { error: error };
                }
            },
            verify_all: function (event) {
                var errors = 0, html = "", ids = _variables.is_modify === true ? _variables.modify : _variables.ids;
                for (var prop in ids) {
                    var is_same = UTILS.isDefined(event) && UTILS.isDefined(event.target) ? event.target.id === ids[prop] : false, element = is_same ? event.target : document.getElementById(ids[prop]), error = _methods.verify(element, event);
                    if (error.error !== 0 && UTILS.isDefined(error.text) && UTILS.hasClass({ element: element, class: 'placeholder-error' }))
                        html += "- " + error.text + "<br>";
                    errors += error.error;
                }
                _methods.values(_variables.sign_up);
                if (_variables.is_modify === true)
                    errors += JSON.stringify(_variables.m) === JSON.stringify(_variables.sign_up) ? 1 : 0;
                document.getElementById("my_account_sign_up_btn").disabled = errors === 0 ? false : true;
                document.getElementById("my_account_sign_up_errors").innerHTML = html;
                document.getElementById("my_account_sign_up_errors").style.display = html === "" ? 'none' : 'block';
                return errors;
            },
            postal_code: function () {
                _variables.search_btn.disabled = true;
                _variables.sign_up_btn.disabled = true;
                _variables.app.module('maps').get({
                    btn: _variables.search_btn,
                    value: document.getElementById('my_account_sign_up_postal_code').value,
                    callback: _methods.postal_code_callback
                });
                return false;
            },
            set_location: function (data, variable, modify) {
                variable.user_state = modify === true ? data.user_state : data.state;
                variable.user_country = modify === true ? data.user_country : data.country;
                variable.user_city = modify === true ? data.user_city : data.city;
                variable.user_postal_code = modify === true ? data.user_postal_code : data.postal_code;
                variable.user_line1 = modify === true ? data.user_line1 : data.line1;
                variable.user_formatted = modify === true ? data.user_formatted : data.formatted;
            },
            postal_code_callback: function (data) {
                if (!UTILS.isDefined(data.error)) {
                    _methods.set_location(data, _variables.sign_up);
                } else {
                    delete _variables.sign_up.user_state;
                    delete _variables.sign_up.user_country;
                    delete _variables.sign_up.user_city;
                    delete _variables.sign_up.user_postal_code;
                    delete _variables.sign_up.user_line1;
                    delete _variables.sign_up.user_formatted;
                }
                _methods.verify_all();
            },
            get: function (data) {
                if (!UTILS.isDefined(data.user_first_name))
                    return;

                document.getElementById('my_account_passwords').style.display = 'none';
                document.getElementById('form_in_container').style.display = 'none';
                document.getElementById('form_sign_up').style.display = 'block';
                document.getElementById('my_account_sign_up_btn').innerHTML = "modify";
                document.getElementById('my_account_sign_up_user_first_name').value = data.user_first_name;
                document.getElementById('my_account_sign_up_user_last_name').value = data.user_last_name;
                document.getElementById('my_account_sign_up_user_name').value = data.user_name;
                document.getElementById('my_account_sign_up_user_phone_number').value = data.user_phone_number;
                document.getElementById('my_account_sign_up_line2').value = data.user_line2;

                _variables.is_modify = true;
                _methods.set_location(data, _variables.sign_up, true);
                _methods.set_location(data, _variables.m, true);
                _methods.values(_variables.m);
            },
            values: function (data) {
                var ids = _variables.is_modify === true ? _variables.modify : _variables.ids;
                for (var prop in ids)
                    if (ids[prop] !== "my_account_sign_up_postal_code")
                        data[ids[prop].replace('my_account_sign_up_', '')] = document.getElementById(ids[prop]).value;
                data['user_line2'] = document.getElementById('my_account_sign_up_line2').value === "" ? null : document.getElementById('my_account_sign_up_line2').value;
            },
            btn_state: function (state, text, btn) {
                if (state === true) {
                    UTILS.addClass({ element: btn, class: 'keep_color' });
                    btn.disabled = true;
                } else {
                    UTILS.removeClass({ element: btn, class: 'keep_color' });
                    btn.disabled = false;
                }
                btn.innerHTML = text;

            },
            get_submit_data: function () {
                if (_variables.is_modify === true) {
                    var modifed = {};
                    for (var prop in _variables.sign_up)
                        if (_variables.sign_up[prop] !== _variables.m[prop])
                            modifed[prop] = _variables.sign_up[prop];
                    modifed["user_id"] = _variables.sign_up["user_id"];
                    return modifed;
                } else
                    return _variables.sign_up;
            },
            submit_callback: function (data, submit_data) {
                setTimeout(function () {
                    var json = JSON.parse(data);
                    if (_variables.is_modify === true) {
                        _methods.btn_state(false, "modify", _variables.sign_up_btn);
                        if (json.code === 200) {
                            _variables.sign_up_btn.disabled = true;
                            _variables.sign_up_btn.innerHTML = "modify";
                            if (UTILS.isDefined(submit_data.user_name))
                                UTILS.createCookie({ name: 'name', value: _variables.sign_up.user_name, days: 356 });
                            for (var prop in submit_data)
                                _variables.m[prop] = submit_data[prop];
                        } else
                            _variables.sign_up_btn.innerHTML = "an error happened... retry";
                    } else {
                        if (json.response === "USER ALREADY EXISTS") {
                            var element = document.getElementById('my_account_sign_up_user_name');
                            document.getElementById("my_account_sign_up_errors").innerHTML = "This email is already used...";
                            document.getElementById("my_account_sign_up_errors").style.display = 'block';
                            if (!UTILS.hasClass({ class: 'placeholder-error', element: element }))
                                UTILS.addClass({ class: 'placeholder-error', element: element });
                        }

                        if (json.code !== 200)
                            _methods.btn_state(false, "retry", _variables.sign_up_btn);
                        else
                            _methods.redirect(json);
                    }
                }, 300);
            },
            redirect: function (data) {
                var view = _variables.app.get_current_p() || 'my_account';
                _variables.app.module('roles').roles(JSON.stringify(data));
                _variables.app.module('view').change_view({ view: view, back: true, replace: true });
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                _variables.search_btn = document.getElementById("my_account_sign_up_postal_code_search_btn");
                _variables.sign_up_btn = document.getElementById("my_account_sign_up_btn");
                if (!this.view_is_hash())
                    return;

                _variables.app.module('roles').locked({
                    view: 'my_account',
                    method: 'account',
                    callback: params.callback,
                    result: _methods.get
                });
            },
            on_click: function (element) {
                if (element.id === 'my_account_sign_up_postal_code_search_btn')
                    _methods.postal_code();

                if (element.id !== 'my_account_step1' && element.id !== 'my_account_step2')
                    return;

                var e1 = _variables.is_modify === false ? document.getElementById('form_in_container') : document.getElementById('form_sign_up');
                var e2 = _variables.is_modify === false ? document.getElementById('form_sign_up') : document.getElementById('form_modify_password');
                var selected = UTILS.hasClass({ element: element, class: 'selected' });

                for (var prop in _variables.ids)
                    UTILS.removeClass({ element: document.getElementById(_variables.ids[prop]), class: 'placeholder-error' });
                for (var prop in _variables.modify)
                    UTILS.removeClass({ element: document.getElementById(_variables.modify[prop]), class: 'placeholder-error' });
                for (var prop in _variables.pass)
                    UTILS.removeClass({ element: document.getElementById(_variables.pass[prop]), class: 'placeholder-error' });
                document.getElementById('my_account_modify_password_errors').innerHTML = "";
                document.getElementById('my_account_sign_up_errors').innerHTML = "";

                if (element.id === 'my_account_step1' && !selected) {
                    UTILS.addClass({ element: element, class: 'selected' });
                    UTILS.removeClass({ element: document.getElementById('my_account_step2'), class: 'selected' });

                    e1.style.display = 'block';
                    e2.style.display = 'none';
                }
                if (element.id === 'my_account_step2' && !selected) {
                    UTILS.addClass({ element: element, class: 'selected' });
                    UTILS.removeClass({ element: document.getElementById('my_account_step1'), class: 'selected' });

                    e1.style.display = 'none';
                    e2.style.display = 'block';
                }
            },
            sign_up_event: function (event) {
                if (event.target.id === "my_account_sign_up_postal_code")
                    document.getElementById('my_account_sign_up_postal_code_search_btn').disabled = event.target.value === "" ? true : false;
                if (event.target.id === "my_account_sign_up_postal_code" && parseInt(event.keyCode) === 13) {
                    _methods.verify_all(event);
                    _methods.postal_code();
                    return false;
                }

                _methods.verify_all(event);
            },
            sign_up_submit: function () {
                if (_methods.verify_all() === 0) {
                    var submit_data = _methods.get_submit_data();
                    _methods.btn_state(true, _variables.is_modify === true ? "modifying..." : "creating...", _variables.sign_up_btn);
                    _variables.app.module('ajax').call({
                        method: _variables.is_modify === true ? 'modify' : 'create',
                        data: JSON.stringify(submit_data),
                        callback: function (data) {
                            _methods.submit_callback(data, submit_data);
                        }
                    });
                }
                return false;
            },
            modify_password_event: function (e) {
                var error = null, errors = 0, element = null, html = "";
                for (var prop in _variables.pass) {
                    element = document.getElementById(_variables.pass[prop]);
                    error = _methods.verify(element, e);
                    if (error.error !== 0 && UTILS.isDefined(error.text) && UTILS.hasClass({ element: element, class: 'placeholder-error' }) && _variables.pass[prop] !== _variables.pass[0])
                        html += "- " + error.text + "<br>";
                    errors += error.error;
                }

                if (errors === 0) {
                    if (document.getElementById('my_account_modify_password_old_user_password').value === document.getElementById('my_account_modify_password_user_password').value) {
                        html += "- New and old passwords cannot match<br>";
                        errors++;
                    }
                }

                document.getElementById("my_account_modify_password_btn").disabled = errors === 0 ? false : true;
                document.getElementById("my_account_modify_password_errors").innerHTML = html;
                document.getElementById("my_account_modify_password_errors").style.display = html === "" ? 'none' : 'block';
                return errors;
            },
            modify_password_submit: function () {
                if (this.modify_password_event() === 0) {
                    var old = document.getElementById('my_account_modify_password_old_user_password'), pass = document.getElementById('my_account_modify_password_user_password'), repass = document.getElementById('my_account_modify_password_user_retype_password');
                    var btn = document.getElementById('my_account_modify_password_btn');
                    _methods.btn_state(false, "modifying...", btn);
                    _variables.app.module('ajax').call({
                        method: 'modify_password',
                        data: JSON.stringify({ user_old_password: old.value, user_password: pass.value, user_repassword: repass.value }),
                        callback: function (data) {
                            setTimeout(function () {
                                var json = JSON.parse(data);
                                if (json.response === "BAD OLD") {
                                    document.getElementById("my_account_modify_password_errors").innerHTML += "The old password is invalid";
                                    document.getElementById("my_account_modify_password_errors").style.display = 'block';
                                    _methods.btn_state(false, "retry", btn);
                                } else if (json.code !== 200) {
                                    _methods.btn_state(false, "retry", btn);
                                } else {
                                    _methods.btn_state(false, "modify password", btn);
                                    old.value = "";
                                    pass.value = "";
                                    repass.value = "";
                                    btn.disabled = true;
                                }
                            }, 300);
                        }
                    });
                }
                return false;
            }
        };
    }
});