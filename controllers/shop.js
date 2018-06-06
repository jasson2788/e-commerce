DIAMOND.controller.create({
    name: 'shop',
    controller: function () {
        var _variables = {};
        var _methods = {
            get: function (data) {
                if (data.length === 0) {
                    document.getElementById('shop_items').innerHTML = "No items... come back later.";
                    return;
                }

                var frag = _variables.app.module('template').from_array({
                    template: 'shop_items_template',
                    array: data,
                    before: function (element) {
                        if (UTILS.isNumber(element.products_price_discount)) {
                            element.products_discount = "-" + (100 - parseInt((element.products_price_discount * 100) / (element.products_price * 100) * 100)) + "%";
                            element.products_price = _variables.app.module('currency').convert(element.products_price_discount);
                            element.class = "discount";
                        } else
                            element.products_price = _variables.app.module('currency').convert(element.products_price);

                        if (element.products_small === "0" && element.products_medium === "0" && element.products_large === "0" &&
                            element.products_xlarge === "0" && element.products_x2large === "0" && element.products_x3large === "0" &&
                            element.products_x4large === "0" && element.products_x5large === "0") {
                            element.class += " not_available";
                            return;
                        }

                        if (element.products_sold_out === "1")
                            element.class += " sold_out";
                    },
                    data: { id: "products_id", p: "products_id" }
                });
                UTILS.replace({ id: 'shop_items', content: frag });
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;
                _variables.app.module('ajax').get({
                    model: 'products',
                    callback: function (data) {
                        _methods.get(data);
                    },
                    error_callback: function (data) {
                        _variables.app.error();
                    },
                    universal_callback: function () {
                        params.callback();
                    }
                });
            }
        };
    }
});