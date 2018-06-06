DIAMOND.controller.create({
    name: 'my_orders',
    controller: function () {
        var _variables = {
            timer: null, timer_sec: 1, processing: {}, ALL_STEPS: 4
        };

        var _methods = {
            orders: function (data) {
                _variables.app.module('cart').count_cart();

                if (data.length === 0 || data === false) {
                    document.getElementById('my_orders').innerHTML = "No orders available... :(";
                    return;
                }

                _variables.processing = {};
                var frag = _variables.app.module('template').from_array({
                    template: 'template_orders',
                    array: data,
                    before: _methods.before,
                    data: { id: "order_id", pro: "order_processing" }
                });

                UTILS.replace({ id: 'my_orders', content: frag });
            },
            before: function (element) {
                if (!UTILS.isDefined(element.order_processing))
                    _variables.processing.id = element.order_id;
                element.order_address = element.order_country + ", " + element.order_state + ", " + element.order_city + ", " + element.order_postal_code + ", " + element.order_line1;
                if (UTILS.isDefined(element.order_line2))
                    element.order_address += ", " + element.order_line2;
                element.order_processing = _methods.progress_from_number(parseInt(element.order_processing));
                element.order_subtotal = UTILS.round(element.order_subtotal, 2) + element.order_currency;
                element.order_shipping = UTILS.round(element.order_shipping, 2) + element.order_currency;
                element.order_total = UTILS.round(element.order_total, 2) + element.order_currency;
            },
            progress_from_number: function (num) {
                switch (num) {
                    case 1:
                        return num + '/' + _variables.ALL_STEPS + ' - verifying';
                    case 2:
                        return num + '/' + _variables.ALL_STEPS + ' - retreiving';
                    case 3:
                        return num + '/' + _variables.ALL_STEPS + ' - executing';
                    case 4:
                        return "CONFIRMED";
                    case 98:
                        return "FAILED TO EXECUTE";
                    case 99:
                        return "FAILED TO CAPTURE";
                    case 100:
                        return "UNKNOWN ERROR";
                }
            },
            order_by_id: function (id, parent, details, loading) {
                _variables.app.module('ajax').call({
                    data: "id=" + id,
                    method: 'orders',
                    callback: function (data) {
                        var parsed = UTILS.parse(data);
                        if (!UTILS.isDefined(parsed) || !UTILS.isDefined(parsed.response) || parsed.response.length === 0 || parsed === false) {
                            parent.removeAttribute('data-get');
                            parent.querySelectorAll('.template_orders_items')[0].innerHTML = "your items could not be loading...";
                        } else {
                            var content = _variables.app.module('template').from_array({
                                template: 'template_orders_items',
                                array: parsed.response
                            });

                            UTILS.replace({ element: parent.querySelectorAll('.template_orders_items')[0], content: content });
                        }

                        setTimeout(function () {
                            details.display = 'block';
                            loading.display = 'none';
                            _variables.app.module('scrollbar').update('content');
                        }, 300);
                    }
                });
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                _variables.app.module('roles').locked({
                    view: 'my_orders',
                    method: 'orders',
                    callback: params.callback,
                    result: _methods.orders
                });
            },
            on_click: function (element) {
                if (element.id === 'order_process_icon')
                    document.getElementById('order_process').style.display = 'none';
                if (UTILS.hasClass({ element: element, class: 'template_orders' })) {
                    var parent = element.parentElement, details = parent.querySelectorAll('.template_orders_details')[0].style, loading = parent.querySelectorAll('.template_orders_loading_loading')[0].style, error = parent.querySelectorAll('.template_orders_loading_error')[0].style;
                    if (parent.getAttribute('data-pro') !== 'CONFIRMED') {
                        if ((parent.getAttribute('data-pro') === _methods.progress_from_number(98) || parent.getAttribute('data-pro') === _methods.progress_from_number(99)) && parent.getAttribute('data-get') !== "true") {
                            error.display = 'block';
                            parent.setAttribute('data-get', 'true');
                        } else if (parent.getAttribute('data-pro') === _methods.progress_from_number(98) || parent.getAttribute('data-pro') === _methods.progress_from_number(99)) {
                            error.display = 'none';
                            parent.setAttribute('data-get', 'false');
                        }
                        return;
                    }

                    if (parent.getAttribute('data-get') !== "true") {
                        details.display = 'none';
                        loading.display = 'block';
                        parent.setAttribute('data-get', 'true');
                        _variables.app.module('scrollbar').update('content');
                        _methods.order_by_id(parent.getAttribute('data-id'), parent, details, loading);
                    } else {
                        details.display = details.display === 'block' ? "none" : "block";
                        _variables.app.module('scrollbar').update('content');
                    }
                }
            }
        };
    }
});