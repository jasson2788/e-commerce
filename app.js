DIAMOND.core.app({
    name: 'eCommerce',
    pages: {
        main: null, shop: null, cart: null,
        my_account: null, my_orders: null,
        contact_us: null, about_us: null, options: null,
        item: null, checkout: null, forgot_password: null, my_sales: null,
        precheckout: null, order: null
    },
    default_page: UTILS.isMobile() ? "shop" : "main",
    no_menu: UTILS.getHash(location.href) === 'order' ? true : false,
    ajax: {
        server: window.location.protocol + "//" + window.location.hostname + '/api/',
        methods: {
            get_currency: { method: 'GET', controller: 'eCommerce' },
            options: { method: 'GET', controller: 'eCommerce' },
            coupon: { method: 'GET', controller: 'eCommerce' },
            checkout: { method: 'GET', controller: 'eCommerce' },
            cart: { method: 'GET', controller: 'eCommerce' },
            get: { method: 'GET', controller: 'eCommerce' },
            mail: { method: 'POST', controller: 'eCommerce' },
            mail_connected: { method: 'GET', controller: 'eCommerce' },
            receive_payment: { method: 'GET', controller: 'eCommerce' },
            before_checkout: { method: 'GET', controller: 'eCommerce' },
            orders: { method: 'GET', controller: 'eCommerce' },
            order: { method: 'GET', controller: 'eCommerce' },
            process: { method: 'GET', controller: 'eCommerce' },
            account: { method: 'GET', controller: 'eCommerce' },
            my_sales: { method: 'GET', controller: 'eCommerce' },
            verify: { method: 'GET', controller: 'User' },
            forgot: { method: 'GET', controller: 'User' },
            create: { method: 'POST', controller: 'User' },
            modify: { method: 'POST', controller: 'User' },
            modify_password: { method: 'POST', controller: 'User' },
            token: { method: 'GET', controller: 'User' }
        }
    },
    methods: function () {
        var _variables = {};
        var _methods = {
            resize: function () {
                if (window.innerWidth > 920)
                    document.getElementById('menu').style[UTILS.transform()] = 'translate(' + (window.innerWidth - 910) / 2 + 'px, 0px)';
            },
            token: function (callback) {
                _variables.app.module('locked').identify();
                var data = { name: UTILS.readCookie("name"), token: UTILS.readCookie("token") };
                if (UTILS.isDefined(data.name) && UTILS.isDefined(data.token)) {
                    _variables.app.module('ajax').call({
                        method: 'token',
                        callback: function (data) {
                            _variables.app.module('currency').set();
                            _variables.app.module('roles').roles(data, callback);
                        }
                    });
                } else {
                    _variables.app.module('currency').set();
                    _variables.app.module('roles').roles({ "code": 400, "response": "NOT FOUND" }, callback);
                }
            },
            init: function () {
                UTILS.addListener({ target: window, event: "resize", callback: _methods.resize });
                _methods.resize();

                if (UTILS.isMobile()) {
                    document.getElementById('menu-logo-text').setAttribute('data-view', 'shop');
                    document.getElementById('smenu-nav-main').style.display = 'none';
                }

                _variables.app.module('cart').count_cart();
            }
        };

        return {
            on_init: function (params) {
                _variables.app = params.ref;

                _methods.init();
                _methods.token(params.callback);
            }
        };
    }
});