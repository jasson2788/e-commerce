DIAMOND.controller.create({
    name: 'order',
    controller: function () {
        var _variables = {};
        var _methods = {
            clear: function () {
                UTILS.createCookie({ name: "cart", value: "", days: -1 });
            },
            process: function (id) {
                document.getElementById('order_thank_you').innerHTML = "Votre commande est en traitement (0)";
                _variables.app.module('ajax').call({
                    data: "processing_id=" + id,
                    method: 'process',
                    callback: function (data) {
                        _methods.clear();
                        clearInterval(_variables.interval);
                        document.getElementById('order_thank_you').innerHTML = "merci pour votre commande";
                        document.getElementById('order_notification').innerHTML = "vous recevrez un email de confirmation sous peu...";
                        document.getElementById('order_back_btn').style.display = "block";
                    },
                    no_timeout: true
                });

                _variables.i = 1;
                _variables.interval = setInterval(function () {
                    document.getElementById('order_thank_you').innerHTML = "Votre commande est en traitement (" + _variables.i++ + ")";
                }, 1000);
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                document.getElementById('menu').style.display = 'none';
                document.getElementById('main-content-content').style.paddingRight = '0px';
                document.getElementById('main-content-content').style.left = '0px';

                var id = _variables.app.get_current_p();
                _variables.app.module('ajax').call({
                    data: "id=" + id,
                    method: 'order',
                    view: 'order',
                    callback: function (data) {
                        var json = UTILS.parse(data);
                        if (json.code === 200) {
                            document.getElementById('order_thank_you_ctn').style.display = 'block';
                            document.getElementById('order_id').innerHTML = id;
                            if (!UTILS.isDefined(json.response.order_processing))
                                _methods.process(json.response.order_id);
                            else {
                                document.getElementById('order_thank_you').innerHTML = "merci pour votre commande";
                                document.getElementById('order_notification').innerHTML = "vous recevrez un email de confirmation sous peu...";
                                document.getElementById('order_back_btn').style.display = "block";
                            }
                        } else {
                            document.getElementById('order_not_found_ctn').style.display = 'block';
                            document.getElementById('order_back_btn').style.display = "block";
                        }
                        params.callback();
                    }
                });
            },
            on_click: function (element) {
                if (element.id === 'order_back_btn') {
                    location.href = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
                }
            }
        };
    }
});