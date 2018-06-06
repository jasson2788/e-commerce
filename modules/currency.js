DIAMOND.module.create({
    name: 'currency',
    module: function () {
        return {
            get_list: function () {
                return [{ v: "USD" }, { v: "CAD" }, { v: "GBP" }, { v: "EUR" }, { v: "AUD" }, { v: "JPY" }, { v: "RUB" }, { v: "HKD" }, { v: "CHF" }];
            },
            currency: function (value) {
                if (UTILS.isDefined(value))
                    UTILS.createCookie({ days: 365, name: "currency", value: value });
                else
                    return UTILS.readCookie("currency");
            },
            rate: function () {
                return parseFloat(UTILS.readCookie("currency_rate"));
            },
            convert: function (price) {
                var price_in_cents = price * 100, rate = this.rate(), currency = this.currency();
                return UTILS.round(price_in_cents * rate / 100, 2) + currency;
            },
            get: function (price) {
                var price_in_cents = price * 100, rate = this.rate();
                return parseFloat(UTILS.round(parseFloat(price_in_cents * rate / 100), 2));
            },
            set: function () {
                if (UTILS.readCookie('currency') == null) {
                    UTILS.createCookie({ days: 365, name: "currency", value: "CAD" });
                    UTILS.createCookie({ days: 365, name: "currency_rate", value: 1 });
                }
                document.getElementById('menu-mobile-currency').innerHTML = UTILS.readCookie('currency');
                document.getElementById('menu-nav-options-currency').innerHTML = "(" + UTILS.readCookie('currency') + ")";
                document.getElementById('menu-nav-options-currency-mobile').innerHTML = "(" + UTILS.readCookie('currency') + ")";
            }
        };
    }
});