DIAMOND.module.create({
    name: 'cart',
    module: function () {
        return {
            count_cart: function () {
                var cart = UTILS.readCookie('cart'), items = 0;
                try {
                    cart = JSON.parse(cart);
                } catch (e) {
                    cart = 'NOT_EXISTS';
                }

                if (cart !== 'NOT_EXISTS') {
                    var items = 0;
                    for (var prop in cart)
                        for (var prop2 in cart[prop])
                            items += cart[prop][prop2];
                }

                document.getElementById('cart_items_count').innerHTML = "(" + items + ")";
                document.getElementById('cart_items_count2').innerHTML = "(" + items + ")";
                document.getElementById('menu-mobile-cart-items').innerHTML = items;
                return items;
            },
            add: function (params) {
                var cart = UTILS.readCookie("cart"), create_new = !UTILS.isDefined(cart);
                try {
                    cart = JSON.parse(cart);
                } catch (e) {
                    create_new = true;
                }

                if (params.q < 1)
                    return;

                if (create_new) {
                    UTILS.createCookie({ name: "cart", value: JSON.stringify(params.json), days: 30 });
                } else {
                    if (UTILS.isDefined(cart[params.id])) {
                        if (UTILS.isDefined(cart[params.id][params.size]))
                            cart[params.id][params.size] += params.q;
                        else
                            cart[params.id][params.size] = params.q;
                    } else {
                        cart[params.id] = {};
                        cart[params.id][params.size] = params.q;
                    }

                    UTILS.createCookie({ name: "cart", value: JSON.stringify(cart), days: 30 });
                }

                this.count_cart();
            }
        };
    }
});