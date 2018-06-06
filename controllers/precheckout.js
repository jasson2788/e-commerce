DIAMOND.controller.create({
    name: 'precheckout',
    controller: function () {
        var _variables = {};
        return {
            init: function (params) {
                _variables.app = params.app;

                if (!this.view_is_hash())
                    return;

                _variables.app.module('ajax').call({
                    method: 'mail_connected',
                    view: 'precheckout',
                    callback: function (data) {
                        var json = UTILS.parse(data);
                        if (json.code === 200)
                            DIAMOND.core.app().module('view').change_view({ view: 'checkout', replace: true, back: true });
                        params.callback();
                    }
                });
            }
        };
    }
});