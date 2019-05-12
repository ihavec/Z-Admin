layui.define(['element', 'layer'], function (exports) {

    var element = layui.element;
    var $ = jQuery = layui.jquery;
    var layer = layui.layer;

    var currentActiveTabID = undefined;

    var tabRightMenu = function() {
        this.v = "0.1";
    };

    tabRightMenu.prototype.render = function(config) {
        if (!config.filter) {
            console.error("[ERROR]使用 tabRightMenu 组件需要指定 'filter' 属性！");
            return;
        }

        this.filter = config.filter;
        this.width = config.width ? config.width : 110;// 右键弹出框的宽度，一般100~110即可

        // 固定的 ID.
        this.pintabIDs = config.pintabIDs;

        var defaultNavArr = [
            {eventName: 'closeThis', title: '关闭此页'},
            {eventName: 'closeAll', title: '关闭所有'},
            {eventName: 'closeOther', title: '关闭其它'},
            {eventName: 'closeLeft', title: '关闭左侧'},
            {eventName: 'closeRight', title: '关闭右侧'}
        ];

        config.navArr = config.navArr || defaultNavArr;
        createRightMenu(config);
    };

    function createStyle(config) {
        return ".rightmenu{position:absolute;width:" + config.width + "px;z-index:9999;display:none;background-color:#fff;padding:2px;color:#333;border:1px solid #eee;border-radius:2px;cursor:pointer}.rightmenu li{text-align:center;display:block;height:30px;line-height:30px;margin:8px 0 8px 0}.rightmenu li:hover{background-color:#f2f2f2;color:#000}";
    }

    function createRightMenu(config) {
        // 使用"filter"属性作为css样式名称
        $("<style></style>").text(createStyle(config)).appendTo($("head"));

        var li = '';

        $.each(config.navArr, function (index, conf) {
            if (conf.eventName === 'line') {
                li += '<hr/>';
            } else {
                li += '<li data-type="' + conf.eventName + '"><i class="layui-icon ' + conf.icon + '"></i>' + conf.title + '</li>';
            }
        });

        var ul = '<ul class="rightmenu">' + li + '</ul>';
        $(ul).appendTo("body");

        customRightClick(config);
    }

    function customRightClick(config) {

        //桌面点击右击 todo  document 范围变小.
        $(document).on("contextmenu", "li", function (e) {
            var popupmenu = $(".rightmenu");
            popupmenu.show();
            currentActiveTabID = $(e.target).attr('lay-id');

            var l = ($(document).width() - e.clientX) < popupmenu.width() ? (e.clientX - popupmenu.width()) : e.clientX;
            var t = ($(document).height() - e.clientY) < popupmenu.height() ? (e.clientY - popupmenu.height()) : e.clientY;

            popupmenu.css({left: l,top: t}).show();
            return false;
        });

        // 点击空白处隐藏右键菜单.
        $(document).click(function () {
            $(".rightmenu").hide();
        });

        // 点击右键菜单的功能时.
        $(".rightmenu li").click(function () {
            var event = $(this).attr("data-type");

            var tabs = $(".layui-tab[lay-filter='" + config.filter + "'] li");

            if (event === "closeThis") {
                if (isAllowClose(currentActiveTabID)) {
                    element.tabDelete(config.filter, currentActiveTabID);
                } else {
                    layer.msg("此页不允许关闭");
                }
            } else if (event === "closeAll") {
                $.each(tabs, function (i) {
                    var id = $(this).attr("lay-id");
                    if (isAllowClose(id)) {
                        element.tabDelete(config.filter, id);
                    }
                });
            } else if (event === "closeOther") {
                $.each(tabs, function (i) {
                    var id = $(this).attr("lay-id");
                    if (isAllowClose(id) && id !== currentActiveTabID) {
                        element.tabDelete(config.filter, id);
                    }
                });
            } else if (event === "closeLeft") {
                $.each(tabs, function (i) {
                    var id = $(this).attr("lay-id");
                    if (isAllowClose(id) && id !== currentActiveTabID) {
                        element.tabDelete(config.filter, id);
                    }
                });
            } else if (event === "closeRight") {
                var flag = false;
                $.each(tabs, function (i) {
                    var id = $(this).attr("lay-id");

                    if (id === currentActiveTabID) {
                        flag = true;
                        return true;
                    }

                    if (flag && isAllowClose(id)) {
                        element.tabDelete(config.filter, id);
                    }
                });
            }

            $(".rightmenu").hide();
        });
    }

    /**
     * 是否允许关闭.
     */
    function isAllowClose(id) {
        return !(layui.tabRightMenu.pintabIDs && layui.tabRightMenu.pintabIDs.indexOf(id) !== -1 || id === undefined);
    }

    exports("tabRightMenu", new tabRightMenu());
});