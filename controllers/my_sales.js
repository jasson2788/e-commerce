DIAMOND.controller.create({
    name: 'my_sales',
    controller: function () {
        var _variables = {};
        var _methods = {
            get: function (data) {
                if (!UTILS.isDefined(data.coupon) || !UTILS.isDefined(data.coupon.coupon_payed)) {
                    document.getElementById('container_my_sales').style.display = 'none';
                    document.getElementById('container_my_sales_no_coupon').style.display = 'block';
                    return;
                }

                if (data.claims.length !== 0) {
                    var frag = _variables.app.module('template').from_array({
                        template: 'sales_claims_history_template',
                        before: _methods.before,
                        array: data.claims
                    });
                    UTILS.replace({ id: 'sales_claims_history_container', content: frag });
                } else {
                    document.getElementById('sales_claims_history_container').innerHTML = "You have no recent claims...";
                }
                _methods.coupon_side_bar(data);
            },
            receive_payment: function (btn) {
                _methods.lock(btn);
                _variables.app.module('ajax').call({
                    method: 'receive_payment',
                    data: "data=" + JSON.stringify({
                        email: document.getElementById('sales_container_form_email').value,
                        pass: document.getElementById('sales_container_form_email_pass').value
                    }),
                    callback: function (data) {
                        _methods.unlock(btn);

                        data = JSON.parse(data);
                        if (data.code === 401 && data.response === "BAD PASSWORD") {
                            document.getElementById('sales_container_form').style.display = 'block';
                            document.getElementById('sales_container_form_confirm').style.display = 'none';
                            UTILS.addClass({ element: document.getElementById('sales_container_form_email_pass'), class: 'placeholder-error' });
                        } else if (data.code === 401 && data.response === "DISABLED") {
                            document.getElementById('sales_container_form_disabled').style.display = 'block';
                            document.getElementById('sales_container_form').style.display = 'none';
                            document.getElementById('sales_container_form_confirm').style.display = 'none';
                        } else if (data.code === 200) {
                            var frag = _variables.app.module('template').element({
                                template: 'sales_claims_history_template',
                                before: _methods.before,
                                element: data.response.claims
                            }), container = document.getElementById('sales_claims_history_container');
                            if (container.children.length === 0)
                                UTILS.replace({ id: 'sales_claims_history_container', content: frag });
                            else
                                container.insertBefore(frag, container.children[0]);
                            _methods.coupon_side_bar(data.response);
                        } else if (data.code === 400) {
                            document.getElementById('sales_container_form_confirm_text').innerHTML = "An error happened...";
                            btn.innerHTML = "reclaim";
                        }
                    },
                    no_timeout: true
                });
            },
            before: function (element) {
                element.claim_price = UTILS.round(element.claim_price, 2) + element.claim_currency;
            },
            coupon_side_bar: function (data) {
                document.getElementById('sales_coupon_can_claim').innerHTML = _variables.app.module('currency').convert(parseFloat(data.coupon.coupon_profit_total) - parseFloat(data.coupon.coupon_payed));
                document.getElementById('sales_coupon_profit_total').innerHTML = _variables.app.module('currency').convert(parseFloat(data.coupon.coupon_profit_total));
                document.getElementById('sales_coupon_use').innerHTML = data.coupon.coupon_use;
                document.getElementById('sales_coupon_claimed').innerHTML = _variables.app.module('currency').convert(parseFloat(data.coupon.coupon_payed));

                if (data.coupon.coupon_payed >= data.coupon.coupon_profit_total)
                    document.getElementById('claim_your_share_container').style.display = 'none';
            },
            lock: function (btn) {
                UTILS.addClass({ element: btn, class: 'keep_color' });
                btn.innerHTML = "claiming... (0)";
                _variables.timer_sec = 1;
                _variables.timer = setInterval(function () {
                    btn.innerHTML = "claiming..." + " (" + _variables.timer_sec++ + ")";
                }, 1000);
                btn.disabled = true;
            },
            unlock: function (btn) {
                clearInterval(_variables.timer);
                btn.innerHTML = "claim";
                btn.disabled = false;
                UTILS.removeClass({ element: btn, class: 'keep_color' });
            }
        };
        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                _variables.app.module('roles').locked({
                    view: 'my_sales',
                    method: 'my_sales',
                    callback: params.callback,
                    result: _methods.get
                });
            }
            ,
            on_click: function (element) {
                if (element.id === 'my_sales_btn_cancel') {
                    document.getElementById('sales_container_form').style.display = 'block';
                    document.getElementById('sales_container_form_confirm').style.display = 'none';
                } else if (element.id === 'my_sales_btn_claim')
                    _methods.receive_payment(element);
            }
            ,
            event: function (e) {
                var errors = _variables.app.module('verify').email({ element: document.getElementById('sales_container_form_email'), e: e });
                errors += _variables.app.module('verify').password({ element: document.getElementById('sales_container_form_email_pass'), e: e });
                document.getElementById('receive_payment').disabled = errors === 0 ? false : true;
            }
            ,
            submit: function () {
                _methods.receive_payment();
            }
            ,
            confirm: function () {
                this.event();
                if (document.getElementById('receive_payment').disabled === false) {
                    document.getElementById('sales_container_form').style.display = 'none';
                    document.getElementById('sales_container_form_confirm').style.display = 'block';
                    document.getElementById('sales_container_form_confirm_text').innerHTML = "Do you confirm that \"" + document.getElementById('sales_container_form_email').value + "\" is your paypal email?";
                }
                return false;
            }
        }
            ;
    }
});