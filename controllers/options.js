DIAMOND.controller.create({
    name: 'options',
    controller: function () {
        var _variables = {};
        var _methods = {
            currencies: function (callback) {
                var currencies = _variables.app.module('currency').get_list(), currency = _variables.app.module('currency').currency();
                var frag = _variables.app.module('template').from_array({
                    template: 'template-options-currency',
                    array: currencies,
                    before: function (element) {
                        if (UTILS.isDefined(currency) && element.v === currency)
                            element.class = "selected";
                    },
                    after: function (element, html) {
                        if (UTILS.isDefined(currency) && element.v === currency)
                            _variables.selected_currency = html;
                    },
                    data: { currency: "v" }
                });

                UTILS.replace({ id: 'options-currency-cont', content: frag });
                callback();
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                if (!this.view_is_hash())
                    return;

                if (UTILS.isDefined(_variables.app.module('currency').currency()))
                    _methods.currencies(params.callback);
                else
                    _variables.app.module('ajax').call({
                        method: 'options',
                        callback: function (data) {
                            if (data === "ERROR") {
                                _variables.app.error();
                                params.callback();
                            } else
                                _methods.currencies(params.callback);
                        }
                    });
            },
            on_click: function (element) {
                var currency = element.getAttribute('data-currency');
                if (UTILS.isDefined(currency)) {
                    _variables.app.module('currency').currency(currency);
                    UTILS.removeClass({ element: _variables.selected_currency, class: 'selected' });
                    UTILS.addClass({ element: element, class: 'selected' });
                    _variables.selected_currency = element;
                    document.getElementById('menu-mobile-currency').innerHTML = UTILS.readCookie('currency');
                    document.getElementById('menu-nav-options-currency').innerHTML = "(" + UTILS.readCookie('currency') + ")";
                    document.getElementById('menu-nav-options-currency-mobile').innerHTML = "(" + UTILS.readCookie('currency') + ")";
                }
            }
        };
    }
});