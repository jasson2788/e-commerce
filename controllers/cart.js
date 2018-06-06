DIAMOND.controller.create({
    name: 'cart',
    controller: function () {
        var _variables = {};
        var _methods = {
            /** ==============================================================================================================================
             * Shows all cart elements
             */
            get: function (data) {
                var r = _methods.if_products_are_not_available(data);
                _variables.cart = data.cookie_cart;
                _variables.shipping = data.shipping;
                _variables.prices = {};

                if (UTILS.isDefined(_variables.cart) && Object.keys(_variables.cart).length > 0) {
                    var frag = _variables.app.module('template').from_array({
                        template: 'template-cart-item',
                        array: data.cart,
                        before: function (element) {
                            var price = UTILS.isDefined(element.products_price_discount) ? parseFloat(element.products_price_discount) : parseFloat(element.products_price);
                            element.products_price = _variables.app.module('currency').convert(price * parseInt(element.products_qty));
                            element.qty = {
                                value: element.products_qty, type: 'input', data: [
                                    { prop: 'size', value: element.products_size },
                                    { prop: 'id', value: element.products_id }
                                ]
                            };

                            _variables.prices[element.products_id] = { p: _variables.app.module('currency').get(price), t: element.products_type };
                        },
                        data: { id: "products_id", size: "products_size" }
                    });
                    UTILS.replace({ id: 'cart_items', content: frag });
                }

                _methods.prices(r);
            },
            /** ==============================================================================================================================
             * Gets all prices (Discount, Total, Shipping)
             */
            prices: function (products_not_available) {
                if (!UTILS.isDefined(_variables.cart) || Object.keys(_variables.cart).length === 0) {
                    var products_not_available = UTILS.isDefined(products_not_available) ? products_not_available + "<span class='space'></span>" : "";
                    document.getElementById('cart_items').innerHTML = products_not_available + "<div style='margin-bottom: 5px;'>Il n'y a pas d'items dans votre panier :(</div>" + "<button class='clickable bg-color7 noselect cta' data-view='shop'>CONTINUER</button>";
                    document.getElementById('cart-total').style.display = "none";
                    document.getElementById('cart-fixed').style.display = "none";
                    _variables.app.module('cart').count_cart();
                    return;
                }

                var total = 0, max = { p: 0 }, dicount_default = 'x', discount_id = '', shipping = {}, discount = UTILS.parse(UTILS.readCookie('discount')) || dicount_default, currency = _variables.app.module('currency').currency();
                for (var id in _variables.cart) {
                    for (var size in _variables.cart[id]) {
                        var elem = _variables.prices[id];

                        if (max.p < elem.p)
                            max = elem;
                        total += elem.p * _variables.cart[id][size];

                        if (!UTILS.isDefined(shipping[elem.t]))
                            shipping[elem.t] = _variables.cart[id][size];
                        else
                            shipping[elem.t] += _variables.cart[id][size];
                    }
                }

                var shipping_zone = UTILS.readCookie('shipping_zone'), shipping_price = 0;
                if (shipping_zone !== 'USA' && shipping_zone !== 'Canada' && shipping_zone !== 'International')
                    shipping_zone = 'International';

                if (UTILS.isDefined(_variables.selected_shipping_zone))
                    UTILS.removeClass({ element: _variables.selected_shipping_zone, class: 'selected' });
                _variables.selected_shipping_zone = document.getElementById('cart_shipping_zone_' + shipping_zone.toLowerCase());
                UTILS.addClass({ element: _variables.selected_shipping_zone, class: 'selected' });

                if (_variables.shipping !== false) {
                    shipping_price = _variables.shipping[max.t][shipping_zone].first_item_price;
                    shipping[max.t]--;

                    for (var prop in shipping)
                        if (shipping[prop] > 0)
                            shipping_price += _variables.shipping[prop][shipping_zone].additional_item_price * shipping[prop];
                } else {
                    document.getElementById('cart_shipping').parentElement.style.display = 'none';
                    document.getElementById('cart_shipping_zone_container').style.display = 'none';
                }

                if (UTILS.isDefined(discount) && UTILS.isDefined(discount.coupon_discount) && UTILS.isDefined(discount.coupon_id) && UTILS.isNumber(discount.coupon_discount) && UTILS.isDefined(discount.coupon_type)) {
                    discount_id = discount.coupon_id;
                    if (parseInt(discount.coupon_type) === 0)
                        discount = UTILS.round(total * parseFloat(discount.coupon_discount) / 100, 2);
                    else if (parseInt(discount.coupon_type) === 1)
                        discount = UTILS.round(max.p * parseFloat(discount.coupon_discount) / 100, 2);
                }

                shipping_price = _variables.app.module('currency').get(shipping_price);
                document.getElementById('cart_discount_discount_input').value = discount === dicount_default ? "" : discount_id;
                if (discount !== dicount_default)
                    document.getElementById('cart_discount_discount_input').setAttribute('data-value', discount_id);
                document.getElementById('cart_coupon_discount').innerHTML = discount === dicount_default ? dicount_default : "-" + discount + currency;
                document.getElementById('cart_subtotal_price').innerHTML = UTILS.round(total, 2) + currency;
                document.getElementById('cart_total').innerHTML = discount === dicount_default ? UTILS.round(total + shipping_price, 2) + currency : UTILS.round(total - discount + shipping_price, 2) + currency;
                document.getElementById('cart_shipping').innerHTML = UTILS.round(shipping_price, 2) + currency;
                if (discount === dicount_default)
                    document.getElementById('cart_coupon_discount_ctn').style.display = 'none';
            },
            /** ==============================================================================================================================
             * If one or more products are unavailable show to user a notification
             */
            if_products_are_not_available: function (data) {
                if (data.not_avalaible > 0) {
                    UTILS.createCookie({ name: "cart", value: JSON.stringify(data.cookie_cart), days: 30 });

                    var r = data.not_avalaible + " items ont été enlevés de votre panier car ils ne sont plus en stock.";
                    if (data.not_avalaible === 1)
                        r = data.not_avalaible + " item a été enlevé de votre panier car il n'est plus en stock.";

                    document.getElementById('cart_removed').innerHTML = r;
                    document.getElementById('cart_removed').style.display = 'block';
                    _variables.app.module('cart').count_cart();

                    return r;
                }
            },
            resize: function () {
                if (!UTILS.isDefined(document.getElementById('cart-total')))
                    return;

                var half = (window.innerWidth - 910) / 2, menu = 185 + 10, content = 710 - 300, translateY = half + menu + content;
                if (window.innerWidth <= 920)
                    translateY = window.innerWidth - 300 - 10;
                document.getElementById('cart-total').style[UTILS.transform()] = 'translate(' + translateY + 'px, 0px)';
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                _variables.app.module('ajax').call({
                    method: 'cart',
                    callback: function (data) {
                        var data = UTILS.parse(data);
                        if (UTILS.isDefined(data) && data.code === 200) {
                            if (data.response.coupon !== false)
                                UTILS.createCookie({ name: "discount", value: JSON.stringify(data.response.coupon), days: 30 });
                            else
                                UTILS.createCookie({ name: "discount", value: null, days: -1 });

                            if (UTILS.isDefined(data.response.country))
                                UTILS.createCookie({ name: 'shipping_zone', value: data.response.country, days: 365 });

                            _methods.get(data.response.cart);
                        } else
                            _variables.app.error();
                        params.callback();
                    }
                });


                UTILS.addListener({ target: window, event: "resize", callback: _methods.resize });
                _methods.resize();
            },
            after_change: function () {
                UTILS.removeListener({ target: window, event: "resize", callback: _methods.resize });
            },
            on_click: function (element) {
                if (UTILS.hasClass({ element: element, class: 'cart_item_remove' }) || UTILS.hasClass({ element: element, class: 'cart_item_remove2' })) {
                    var parent = element.parentNode, id = parent.getAttribute('data-id'), size = parent.getAttribute('data-size');

                    delete _variables.cart[id][size];
                    if (Object.keys(_variables.cart[id]).length === 0)
                        delete _variables.cart[id];
                    UTILS.createCookie({ days: 30, name: "cart", value: JSON.stringify(_variables.cart) });
                    var cpt = _variables.app.module('cart').count_cart();
                    _methods.prices();

                    if (cpt !== 0)
                        parent.parentNode.removeChild(parent);
                } else if (UTILS.hasClass({ element: element, class: 'cart_shipping' })) {
                    UTILS.createCookie({ name: 'shipping_zone', value: element.getAttribute('data-shipping-zone'), days: 30 });
                    _methods.prices();
                }
            },
            input: function (input) {
                var qty = parseInt(input.value), id = input.getAttribute('data-id'), size = input.getAttribute('data-size'), currency = " " + _variables.app.module('currency').currency();

                if (qty > 0) {
                    input.parentNode.parentNode.previousElementSibling.children[1].innerHTML = UTILS.round(qty * _variables.prices[id].p, 2) + currency;

                    _variables.cart[id][size] = qty;
                    UTILS.createCookie({ days: 30, name: "cart", value: JSON.stringify(_variables.cart) });

                    _variables.app.module('cart').count_cart();
                    _methods.prices();
                }
            },
            coupon: function () {
                return _variables.app.module('coupon').get(function () {
                    _methods.prices();
                });
            }
        };
    }
});