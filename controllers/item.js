DIAMOND.controller.create({
    name: 'item',
    controller: function () {
        var _variables = {};
        var _methods = {
            size: function (element) {
                if (element.size !== "1") {
                    var item = document.getElementById(element.id);
                    if (UTILS.isDefined(item))
                        item.parentNode.removeChild(item);
                    return false;
                }
                return true;
            },
            get: function () {
                document.getElementById('item_src').src = _variables.data.products_src;
                document.getElementById('item_ctn_name').innerHTML = _variables.data.products_title;
                document.getElementById('item_ctn_type').innerHTML = _variables.data.products_type;
                document.getElementById('item_ctn_desc').innerHTML = _variables.data.products_desc;
                document.getElementById('item_ctn_price').innerHTML = _variables.app.module('currency').convert(_variables.data.products_price);
                if (UTILS.isDefined(_variables.data.products_price_discount)) {
                    document.getElementById('item_ctn_discount').innerHTML = _variables.app.module('currency').convert(_variables.data.products_price_discount);
                    UTILS.addClass({ element: document.getElementById('item_ctn_prices'), class: 'discount' });
                }

                var array = [
                    { size: _variables.data.products_small, id: 'item_ctn_sizes_small' },
                    { size: _variables.data.products_medium, id: 'item_ctn_sizes_medium' },
                    { size: _variables.data.products_large, id: 'item_ctn_sizes_large' },
                    { size: _variables.data.products_xlarge, id: 'item_ctn_sizes_x_large' },
                    { size: _variables.data.products_x2large, id: 'item_ctn_sizes_x2_large' },
                    { size: _variables.data.products_x3large, id: 'item_ctn_sizes_x3_large' },
                    { size: _variables.data.products_x4large, id: 'item_ctn_sizes_x4_large' },
                    { size: _variables.data.products_x5large, id: 'item_ctn_sizes_x5_large' }
                ], sizes = 0;

                for (var prop in array) {
                    if (_methods.size(array[prop])) {
                        if (!UTILS.isDefined(_variables.selected.size)) {
                            _variables.selected.size = document.getElementById(array[prop].id);
                            UTILS.addClass({ element: _variables.selected.size, class: 'selected' });
                        }
                        sizes += 1;
                    }
                }

                _variables.selected.id = _variables.data.products_id;
                _variables.image = _variables.data.products_src;
                if (_variables.data.products_type === "t-shirt")
                    document.getElementById('item_ctn_made').innerHTML = "Handmade in Canada<br>90% cotton/10% polyester";
                else
                    document.getElementById('item_ctn_made').innerHTML = "Handmade in Canada<br>50% cotton/50% polyester";

                var collection = [];

                if (!UTILS.isEmpty(_variables.data.products_src))
                    collection.push(_variables.data.products_src);
                if (!UTILS.isEmpty(_variables.data.products_src_angle))
                    collection.push(_variables.data.products_src_angle);
                if (!UTILS.isEmpty(_variables.data.products_src_back))
                    collection.push(_variables.data.products_src_back);
                if (collection.length === 1)
                    document.getElementById('item_src_ctn_controls').style.display = 'none';

                if (sizes === 0) {
                    document.getElementById('item_ctn_available').style.display = 'none';
                    document.getElementById('item_ctn_unavailable').innerHTML = "Cette item n'est plus disponible.";
                }

                if (_variables.data.products_sold_out === "1") {
                    document.getElementById('item_ctn_available').style.display = 'none';
                    document.getElementById('item_ctn_unavailable').innerHTML = "Cette item n'est plus en stock.";
                }
            },
            add: function (params) {
                _variables.app.module('cart').add(params);
                setTimeout(function () {
                    params.btn.innerHTML = "OK";
                    setTimeout(function () {
                        params.btn.innerHTML = "ajouter au panier";
                        params.btn.disabled = false;
                    }, 300);
                }, 300);
            },
            get_position: function (e) {
                var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop, b = (window.innerWidth - 910) / 2 + 185;

                if (window.innerWidth > 920)
                    x -= b % 2 === 0 ? b : b + 0.5;
                else
                    y -= 61;

                x = ~~(x - (x / document.getElementById('item_src_ctn').offsetWidth * 20));
                y = ~~(y - (y / document.getElementById('item_src_ctn').offsetWidth * 20));

                return { x: x, y: y };
            },
            mouse_move: function (e) {
                if (UTILS.get_computed_prop(document.getElementById('item_src_ctn_zoom'), 'display') === 'none')
                    return;

                var position = _methods.get_position.call(this, e);
                document.getElementById('item_src_ctn_zoom').style.backgroundPosition = "-" + position.x + "px -" + position.y + "px";
            },
            enter: function (e) {
                if (UTILS.get_computed_prop(document.getElementById('item_src_ctn_zoom'), 'display') === 'none') {
                    var zoom = document.getElementById('item_src_ctn_zoom');
                    var position = _methods.get_position.call(document.getElementById('item_src_ctn'), e);

                    zoom.style.backgroundImage = "url('" + _variables.image + "')";
                    zoom.style.backgroundPosition = "-" + position.x + "px -" + position.y + "px";
                    zoom.style.display = 'block';

                    document.getElementById('item_src_ctn').setAttribute('style', 'cursor:zoom-out !important');
                    document.getElementById('item_src_ctn_prev').style.display = 'none';
                    document.getElementById('item_src_ctn_next').style.display = 'none';
                } else {
                    document.getElementById('item_src_ctn').setAttribute('style', 'cursor:zoom-in !important');
                    _methods.leave();
                }
            },
            leave: function () {
                document.getElementById('item_src_ctn_zoom').style.display = 'none';
                document.getElementById('item_src_ctn_prev').style.display = 'block';
                document.getElementById('item_src_ctn_next').style.display = 'block';
            }
        };

        return {
            init: function (params) {
                _variables.app = params.app;
                _variables.selected = {};
                _variables.data = {};
                _variables.image = "";
                _variables.index = 0;

                if (!this.view_is_hash())
                    return;

                _variables.app.module('ajax').get({
                    model: 'products',
                    id: UTILS.isDefined(_variables.app.get_p()) ? _variables.app.get_p() : "null",
                    callback: function (data) {
                        if (UTILS.isDefined(data.products_id)) {
                            _variables.data = data;
                            _methods.get();
                        } else
                            document.getElementById('item').innerHTML = "<div style='margin-bottom: 5px;'>This item does not exist... :(</div>" + "<button class='clickable bg-color7 noselect cta' data-view='shop'>continue shopping</button>";
                    },
                    error_callback: function () {
                        _variables.app.error();
                    },
                    universal_callback: function () {
                        params.callback();
                    }
                });
            },
            on_click: function (e) {
                if (UTILS.hasClass({ element: e, class: 'item_ctn_sizes' }) && !UTILS.hasClass({ element: e, class: 'selected' })) {
                    UTILS.removeClass({ element: _variables.selected.size, class: 'selected' });
                    UTILS.addClass({ element: e, class: 'selected' });
                    _variables.selected.size = e;
                }

                if (e.id === 'item_ctn_btn' || e.id === 'item_ctn_btn_buy') {
                    var json = {}, q = parseInt(document.getElementById('item_ctn_qty').value), id = _variables.selected.id, size = _variables.selected.size.children[0].getAttribute('data-size');
                    if (q < 1 || !UTILS.isNumber(q))
                        return;

                    if (e.id === 'item_ctn_btn') {
                        e.disabled = true;
                        e.innerHTML = "ajout...";
                    }

                    json[id] = {};
                    json[id][size] = q;

                    var params = { q: q, size: size, id: id, json: json, btn: e };
                    if (e.id === 'item_ctn_btn')
                        _methods.add(params);
                    else {
                        _variables.app.module('view').change_view({ view: 'precheckout' });
                        _variables.app.module('cart').add(params);
                    }
                }

                if (e.id === 'item_src_ctn' && !UTILS.isTouch())
                    _methods.enter(_variables.app.module('click').get_event());

                var collection = [];

                if (!UTILS.isEmpty(_variables.data.products_src))
                    collection.push(_variables.data.products_src);
                if (!UTILS.isEmpty(_variables.data.products_src_angle))
                    collection.push(_variables.data.products_src_angle);
                if (!UTILS.isEmpty(_variables.data.products_src_back))
                    collection.push(_variables.data.products_src_back);

                if (e.id === 'item_src_ctn_prev')
                    _variables.index = (_variables.index === 0 ? collection.length : _variables.index) - 1;
                if (e.id === 'item_src_ctn_next')
                    _variables.index = _variables.index === collection.length - 1 ? 0 : _variables.index + 1;
                if (e.id === 'item_src_ctn_next' || e.id === 'item_src_ctn_prev') {
                    document.getElementById('item_src').src = collection[_variables.index];
                    _variables.image = collection[_variables.index];
                }

            },
            mouse_move: function (e) {
                _methods.mouse_move.call(document.getElementById('item_src_ctn'), e);
            },
            mouse_leave: function () {
                _methods.leave();
            }
        };
    }
});