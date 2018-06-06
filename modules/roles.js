DIAMOND.module.create({
    name: 'roles',
    module: function () {
        return {
            roles: function (data, callback) {
                data = UTILS.parse(data);
                document.getElementById('menu-nav-logout').style.display = 'none';
                document.getElementById('menu-nav-my_account').style.display = 'none';
                document.getElementById('menu-nav-my_sales').style.display = 'none';

                document.getElementById('smenu-nav-my_account').style.display = 'none';
                document.getElementById('smenu-nav-my_sales').style.display = 'none';
                document.getElementById('smenu-nav-logout').style.display = 'none';
                document.getElementById('menu-nav-my_orders-text').innerHTML = 'mon compte';
                document.getElementById('menu-nav-my_orders-text2').innerHTML = 'mon compte';

                if (UTILS.isDefined(data) && data.code === 200) {
                    document.getElementById('menu-nav-logout').style.display = 'block';
                    document.getElementById('menu-nav-my_account').style.display = 'block';
                    document.getElementById('smenu-nav-logout').style.display = 'block';
                    document.getElementById('smenu-nav-my_account').style.display = 'block';
                    document.getElementById('menu-nav-my_orders-text').innerHTML = 'Mes commandes';
                    document.getElementById('menu-nav-my_orders-text2').innerHTML = 'Mes commandes';

                    if (data.response.user_role_seller === "1") {
                        document.getElementById('menu-nav-my_sales').style.display = 'block';
                        document.getElementById('smenu-nav-my_sales').style.display = 'block';
                    }
                }

                if (UTILS.isFunction(callback))
                    callback();
            },
            locked: function (params) {
                DIAMOND.core.app().module('ajax').call({
                    method: params.method,
                    callback: function (data) {
                        data = UTILS.parse(data);
                        if (!UTILS.isDefined(data) || !UTILS.isDefined(data.code) || !UTILS.isDefined(data.response)) {
                            DIAMOND.core.app().error();
                            params.callback();
                            return;
                        }

                        if (data.code !== 200 && params.view !== 'my_account') {
                            DIAMOND.core.app().module('view').change_view({ view: 'my_account', init_skip: true, replace: true, p: params.view });
                            return;
                        }

                        params.result(data.response);
                        params.callback();
                    }
                });
            }
        };
    }
});