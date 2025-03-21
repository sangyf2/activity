$(document).ready(function(){
    var canvasElement = $("#diagramCanvas")[0];

    var instance = jsPlumb.getInstance({
        container: canvasElement,  // 指定容器
        Endpoint: ["Dot", { radius: 5 }],
        Connector: "Straight",
        Anchors: ["Top", "Bottom"],
        PaintStyle: { stroke: "#5c96bc", strokeWidth: 2 },
        EndpointStyle: { fill: "#5c96bc" },
        ConnectionOverlays: [
            ["Arrow", { width: 10, length: 10, location: 1, foldback: 0.8 }]
        ]
    });

    // 加载物料数据
    $.getJSON("/workflow/materials", function(data) {
        var html = "";
        $.each(data, function(i, item) {
            html += '<div class="draggable material-item" data-id="'+item.id+'" data-name="'+item.name+'">'+item.name+'</div>';
        });
        $("#materialArea").append(html);
        initDraggable();
    });

    // 加载工艺数据
    $.getJSON("/workflow/crafts", function(data) {
        var html = "";
        $.each(data, function(i, item) {
            html += '<div class="draggable craft-item" data-id="'+item.id+'" data-name="'+item.name+'">'+item.name+'</div>';
        });
        $("#craftArea").append(html);
        initDraggable();
    });

    // 初始化外部拖拽（从物料或工艺区域拖动时）时，加入 grid 配置
    function initDraggable(){
        $(".draggable").draggable({
            helper: "clone",
            revert: "invalid",
            grid: [10,10]
        });
    }

    // 使流程图画布支持拖拽放置
    $("#diagramCanvas").droppable({
        accept: ".draggable",
        drop: function(event, ui){
            var offset = $(this).offset();
            var posX = ui.offset.left - offset.left;
            var posY = ui.offset.top - offset.top;

            // 网格对齐：假设网格大小为 10px
            var gridSize = 5;
            posX = Math.round(posX / gridSize) * gridSize;
            posY = Math.round(posY / gridSize) * gridSize;

            var nodeType = ui.helper.hasClass("material-item") ? "material" : "craft";
            var nodeId = nodeType.charAt(0) + ui.helper.data("id");
            var nodeName = ui.helper.data("name");

            // 物料节点样式补全
            var nodeDiv = $('<div class="node" id="'+nodeId+'" data-type="'+nodeType+'" data-id="'+nodeId+'" data-name="'+nodeName+'"></div>').css({
                "position": "absolute",
                "top": posY,
                "left": posX,
                "border": "2px solid #5c96bc",      // 增加边框
                "background-color": "#f0f8ff",      // 背景色
                "padding": "8px",                   // 内边距
                "min-width": "100px",               // 最小宽度
                "text-align": "center",             // 文字居中
                "cursor": "move"                    // 拖拽指针
            });

            if (nodeType === "material") {
                // 物料节点：矩形，默认下方显示“比例：？”
                var materialHtml = '<div class="material-content" style="text-align:center;">' + nodeName + '</div>' +
                    '<div class="material-ratio" style="text-align:center; font-size:12px;">比例：？</div>';
                nodeDiv.html(materialHtml);
            } else {
                // 工艺节点：圆形，尺寸为 50px
                nodeDiv.css({
                    "border-radius": "50%",          // 正圆形（或调整为椭圆形参数）
                    "width": "80px",                // 椭圆宽度
                    "height": "50px",               // 椭圆高度
                    "border": "2px solid #5c96bc",  // 增加边框
                    "display": "flex",              // 启用 Flexbox
                    "align-items": "center",        // 垂直居中
                    "justify-content": "center",    // 水平居中
                    "overflow": "hidden"            // 防止溢出
                });
                nodeDiv.html(nodeName);
            }

            $("#diagramCanvas").append(nodeDiv);

            // 使用 jsPlumb.draggable，并传入 grid 配置，确保拖拽时也按照网格移动
            instance.draggable(nodeDiv, { grid: [5,5] });

            // 为右侧端点添加自定义属性
            var epRight = instance.addEndpoint(nodeId, {
                anchors: ["Right"],
                isSource: true,
                isTarget: true,
                maxConnections: -1
            });
            $(epRight.canvas).attr("data-anchor", "Right");

            // 为左侧端点添加自定义属性
            var epLeft = instance.addEndpoint(nodeId, {
                anchors: ["Left"],
                isSource: true,
                isTarget: true,
                maxConnections: -1
            });
            $(epLeft.canvas).attr("data-anchor", "Left");


            // 使用 jsPlumb 的 remove 方法删除节点，避免内部状态残留
            nodeDiv.on("contextmenu", function (e) {
                e.preventDefault();
                if (confirm("确定删除该节点？")) {
                    instance.remove($(this));
                }
            });

            // 点击物料节点：弹出输入框填写数量，并更新比例显示
            nodeDiv.on("dblclick", function() {
                var type = $(this).data("type");
                if (type === "material") {
                    // 改进后的输入处理
                    var num = prompt("请输入数字", "1");
                    if (num !== null) {
                        num = parseFloat(num);
                        if (!isNaN(num) && num > 0) {
                            $(this).data("num", num);
                            $(this).find(".material-ratio").html("比例：" + num);
                        } else {
                            alert("请输入有效数字！");
                        }
                    }
                }
            });

            instance.repaintEverything();
        }
    });

    // 点击连线时可删除
    instance.bind("click", function (conn) {
        if (confirm("删除这条连接？")) {
            instance.deleteConnection(conn);
        }
    });

    // 保存流程图数据（节点和连线信息）
    $("#saveDiagram").click(function(){
        var diagramData = {
            nodes: [],
            connections: []
        };

        $("#diagramCanvas .node").each(function(){
            var $node = $(this);
            var nodeData = {
                id: $node.data("id"),
                type: $node.data("type"),
                name: $node.data("name"),
                // 新增样式信息
                position: {
                    x: parseInt($node.css("left")),
                    y: parseInt($node.css("top"))
                },
                style: {
                    width: $node.outerWidth(),
                    height: $node.outerHeight(),
                    borderRadius: $node.css("border-radius"),
                    lineHeight: $node.css("line-height"),
                    backgroundColor: $node.css("background-color")
                }
            };

            if ($node.data("type") === "material") {
                nodeData.content = {
                    name: $node.find(".material-content").text(),
                    ratio: $node.find(".material-ratio").text()
                };
                if ($node.data("num")) {
                    nodeData.num = $node.data("num");
                }
            }

            diagramData.nodes.push(nodeData);
        });

        // 修改保存连接的代码
        $.each(instance.getAllConnections(), function (i, connection) {
            // 从端点的 canvas 元素读取 data-anchor 属性
            const sourceAnchor = $(connection.endpoints[0].canvas).attr("data-anchor");
            const targetAnchor = $(connection.endpoints[1].canvas).attr("data-anchor");

            diagramData.connections.push({
                source: connection.sourceId,
                target: connection.targetId,
                anchors: [sourceAnchor, targetAnchor] // 保存自定义锚点信息
            });
        });


        $.ajax({
            url: "/workflow/processDiagram/save",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ diagramJson: JSON.stringify(diagramData) }),
            success: function(response){
                alert("流程图保存成功！");
            }
        });
    });
});