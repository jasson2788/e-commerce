DIAMOND.controller.create({
    name: 'contact_us',
    controller: function () {
        var _variables = {};
        var _methods = {
            verify: function (element, event) {
                var params = { element: element, e: event };
                if (element.id === "form-contact-us-name")
                    return _variables.app.module('verify').length(params);
                else if (element.id === "form-contact-us-email")
                    return _variables.app.module('verify').email(params);
                else if (element.id === "form-contact-us-mess")
                    return _variables.app.module('verify').length(params);
            },
            verify_all: function (e) {
                var errors = 0;
                for (var prop in _variables.inputs) {
                    var is_same = UTILS.isDefined(e) && UTILS.isDefined(e.target) ? e.target.id === _variables.inputs[prop] : false;
                    var element = is_same ? e.target : document.getElementById(_variables.inputs[prop]);
                    errors += _methods.verify(element, e);
                }

                document.getElementById('form-contact-us-submit').disabled = errors === 0 ? false : true;
                return errors;
            },
            connected: function (data, callback) {
                data = UTILS.parse(data);
                if (data.code === 200) {
                    _variables.inputs = ["form-contact-us-mess"];
                    document.getElementById("form-contact-us-connected").style.display = 'none';
                    document.getElementById('form-contact-us-mess-text').style.marginTop = '0px';
                    document.getElementById('form-contact-us-mess').style.height = '380px';
                } else {
                    _variables.inputs = ["form-contact-us-name", "form-contact-us-email", "form-contact-us-mess"];
                }
                callback();
            },
            get_inputs: function () {
                var elements = [], values = {}, element = null;
                for (var prop in _variables.inputs) {
                    element = document.getElementById(_variables.inputs[prop]);
                    if (_variables.inputs[prop] === "form-contact-us-name")
                        values.name = element.value;
                    else if (_variables.inputs[prop] === "form-contact-us-email")
                        values.email = element.value;
                    else if (_variables.inputs[prop] === "form-contact-us-mess")
                        values.mess = element.value;
                    elements.push(element);
                }
                return { values: values, elements: elements };
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                _variables.app.module('ajax').call({
                    method: 'mail_connected',
                    callback: function (data) {
                        _methods.connected(data, params.callback);
                    }
                });
            },
            event: function (e) {
                _methods.verify_all(e);
            },
            submit: function () {
                if (_methods.verify_all() !== 0)
                    return;

                var btn = document.getElementById('form-contact-us-submit'), inputs = _methods.get_inputs();

                UTILS.addClass({ element: btn, class: 'keep_color' });
                btn.disabled = true;
                btn.innerHTML = "envoie en cours...";


                _variables.app.module('ajax').call({
                    method: 'mail',
                    data: JSON.stringify(inputs.values),
                    callback: function (data) {
                        var data = UTILS.parse(data);
                        setTimeout(function () {
                            if (UTILS.isDefined(data) && data.code === 200) {
                                for (var prop in inputs.elements)
                                    inputs.elements[prop].value = "";
                                btn.innerHTML = "envoyer";
                            } else
                                btn.innerHTML = "essayer encore";
                            UTILS.removeClass({ element: btn, class: 'keep_color' });
                            btn.disabled = false;
                        }, 300);
                    }
                });
                return false;
            }
        };
    }
});