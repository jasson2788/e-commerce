DIAMOND.module.create({
    name: 'coupon',
    module: function () {
        return {
            get: function (callback) {
                var value = document.getElementById('cart_discount_discount_input').value;
                if (value.length === 0 || document.getElementById('cart_discount_discount_input').getAttribute('data-value') === value)
                    return false;
                document.getElementById('cart_discount_discount_input').setAttribute('data-value', value);

                document.getElementById('cart_discount_discount_btn').disabled = true;
                document.getElementById('cart_discount_discount_btn').innerHTML = "searching...";
                DIAMOND.core.app().module('ajax').call({
                    method: 'coupon',
                    data: "data=" + value,
                    callback: function (data) {
                        var json = UTILS.parse(data), final = json.code === 200 ? "apply" : "try again";
                        if (json.code === 200)
                            UTILS.createCookie({ name: "discount", value: JSON.stringify(json.response.coupon), days: 30 });
                        else
                            UTILS.createCookie({ name: "discount", value: null, days: -1 });

                        if (UTILS.isFunction(callback))
                            callback(json.response.order);

                        setTimeout(function () {
                            if (final === "apply")
                                document.getElementById('cart_coupon_discount_ctn').style.display = 'table-row';
                            document.getElementById('cart_discount_discount_btn').disabled = false;
                            document.getElementById('cart_discount_discount_btn').innerHTML = final;
                        }, 300);
                    }
                });

                return false;
            }
        };
    }
});