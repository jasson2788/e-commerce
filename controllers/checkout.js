DIAMOND.controller.create({
    name: 'checkout',
    controller: function () {
        var _variables = {};
        var _methods = {
            populate: function (items) {
                var html = "";
                for (var i = 0; i < items.length; i++)
                    html += "<tr><td class='checkout_order_name'>" + UTILS.escape(items[i].title + " (" + items[i].size + ")") +
                        "</td><td class='checkout_order_qty'>" + UTILS.escape("x" + items[i].quantity) + "</td></tr>";
                document.getElementById('checkout_order_table').innerHTML = html;
            },
            get: function (data) {
                if (data.items.length === 0) {
                    document.getElementById('checkout').innerHTML = "<div style='margin-bottom: 5px;'>No items in the cart... :(</div>" + "<button class='clickable bg-color7 noselect cta' data-view='shop'>continue shopping</button>";
                    UTILS.createCookie({ name: 'cart', value: null, days: -1 });
                    _variables.app.module('cart').count_cart();
                    return;
                }

                _methods.init_price(data);
                _methods.populate(data.items);
            },
            btn_states: function (state) {
                if (state === 1) {
                    UTILS.addClass({ element: _variables.checkout_btn, class: 'keep_color' });
                    _variables.checkout_btn.disabled = true;
                    _variables.checkout_btn.innerHTML = "en traitement... (0)";

                    _variables.timer_sec = 0;
                    _variables.timer = setInterval(function () {
                        _variables.timer_sec++;
                        _variables.checkout_btn.innerHTML = "en traitement... (" + _variables.timer_sec + ")";
                    }, 1000);
                } else if (state === 2) {
                    clearInterval(_variables.timer);
                    UTILS.removeClass({ element: _variables.checkout_btn, class: 'keep_color' });
                    _variables.checkout_btn.disabled = false;
                    _variables.checkout_btn.innerHTML = "essayer encore";
                }
            },
            checkout: function () {
                var __callback = function (data) {
                    var link = UTILS.parse(data);
                    if (UTILS.isDefined(link) && link.code === 200)
                        location.href = link.response;
                    else
                        setTimeout(function () {
                            if (UTILS.isDefined(link) && link.response === "NO ITEMS")
                                location.reload();
                            _methods.btn_states(2);
                        }, 300);
                };

                _methods.btn_states(1);
                _variables.app.module('ajax').call({
                    method: 'checkout',
                    callback: __callback,
                    no_timeout: true
                });
            },
            formated_price: function (price) {
                return UTILS.round(price, 2) + _variables.details.currency;
            },
            init_price: function (data) {
                _variables.details = {
                    total: data.shipping !== false ? data.totalwithshipping : data.total,
                    subtotal: data.subtotal,
                    shipping: data.shipping !== false ? data.shipping_price : false,
                    currency: data.currency.currency,
                    discount: data.discount,
                    discount_code: data.discount_code,
                    country: data.shipping_address.user_country || data.shipping_zone
                };

                if (UTILS.isDefined(data.shipping_address.user_country)) {
                    if (_variables.details.country === 'US')
                        _variables.details.country = 'USA';
                    else if (_variables.details.country === 'CA')
                        _variables.details.country = 'Canada';
                    else
                        _variables.details.country = 'International';
                }

                document.getElementById('cart_discount_discount_input').value = data.discount_code;
                document.getElementById('cart_discount_discount_input').setAttribute('data-value', data.discount_code);

                _methods.price();
            },
            price: function () {
                var country = _variables.details.country;

                document.getElementById('cart_subtotal_price').innerHTML = _methods.formated_price(_variables.details.subtotal);
                if (_variables.details.shipping !== false) {
                    document.getElementById('cart_shipping').innerHTML = _methods.formated_price(_variables.details.shipping[country]);
                    document.getElementById('cart_total').innerHTML = _methods.formated_price(_variables.details.total[country]);
                } else {
                    document.getElementById('cart_total').innerHTML = _methods.formated_price(_variables.details.total);
                    document.getElementById('cart_shipping').parentElement.style.display = 'none';
                    document.getElementById('checkout_countries').style.display = 'none';
                }

                if (UTILS.isDefined(_variables.details.discount) && UTILS.isNumber(_variables.details.discount) && _variables.details.discount !== 0)
                    document.getElementById('cart_coupon_discount').innerHTML = _methods.formated_price(-_variables.details.discount);
                else
                    document.getElementById('cart_coupon_discount_ctn').style.display = 'none';

                var html = "Toutes les informations vous seront envoyées par courriel!";
                if (_variables.details.country === 'USA' || _variables.details.country === 'Canada')
                    html = "Toutes les informations vous seront envoyées par courriel!";
                document.getElementById('checkout_disclaimer').innerHTML = html;

                var shipping_zones = ['USA', 'Canada', "International"];
                for (var prop in shipping_zones) {
                    var element = document.getElementById("checkout_countries_" + shipping_zones[prop]);
                    if (country === shipping_zones[prop]) {
                        UTILS.addClass({ element: element, class: 'selected' });
                        UTILS.createCookie({ name: 'shipping_zone', value: country, days: 365 });
                    } else
                        UTILS.removeClass({ element: element, class: 'selected' });
                }
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                _variables.checkout_btn = document.getElementById('checkout_btn');

                _variables.app.module('ajax').call({
                    method: 'before_checkout',
                    callback: function (data) {
                        var json = JSON.parse(data);
                        if (json.code === 200)
                            _methods.get(json.response);
                        else
                            _variables.app.error();
                        params.callback();
                    },
                    view: 'checkout'
                });
            },
            on_click: function (element) {
                if (element.id === 'checkout_btn')
                    _methods.checkout();

                if (element.id === 'checkout_countries_USA' || element.id === 'checkout_countries_Canada' || element.id === 'checkout_countries_International') {
                    _variables.details.country = element.getAttribute('data-shipping-zone');
                    _methods.price();
                }
            },
            after_change: function () {
                clearInterval(_variables.timer);
            },
            coupon: function () {
                return _variables.app.module('coupon').get(_methods.init_price);
            }
        };
    }
});