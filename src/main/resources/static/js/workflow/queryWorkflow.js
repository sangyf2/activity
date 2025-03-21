$(document).ready(function(){
    var jsPlumbInstance;
    jsPlumb.ready(function() {
        jsPlumbInstance = jsPlumb.getInstance({
            Container: "diagramCanvas",
            Endpoint: ["Dot", { radius: 5 }],
            Connector: "Straight",
            Anchors: ["Top", "Bottom"],
            PaintStyle: { stroke: "#5c96bc", strokeWidth: 2 },
            EndpointStyle: { fill: "#5c96bc" },
            ConnectionOverlays: [
                ["Arrow", { width: 10, length: 10, location: 1, foldback: 0.8 }]
            ]
        });
    });

    // 获取所有保存的流程图数据
    $.getJSON("/diagrams", function(data){
        var html = "";
        $.each(data, function(i, item){
            html += '<div class="diagram-item" data-diagram=\'' + item.diagram_json + '\'>' + item.id + '</div>';
        });
        $("#diagramList").html(html);
    });

    // 点击左侧列表项后还原流程图
    $("#diagramList").on("click", ".diagram-item", function(){
        // jQuery data() 已经将 data-diagram 转为对象
        var diagramData = $(this).data("diagram");
        // 清空画布并重置 jsPlumb 状态
        jsPlumbInstance.reset();
        $("#diagramCanvas").empty();

        $.each(diagramData.nodes, function(i, node){
            var nodeId = node.id;
            var nodeType = node.type;
            var nodeName = node.name;
            var nodeNum = node.num;
            var $nodeDiv = $('<div class="node"></div>')
                .attr("id", nodeId)
                .attr("data-id", nodeId)
                .attr("data-type", nodeType)
                .attr("data-name", nodeName);

            // 如果保存时记录了完整 style，则直接恢复；否则设置默认位置与样式
            if(node.style){
                $nodeDiv.attr("style", node.style);
            } else {
                var left = node.left !== undefined ? node.left : 50 + (i * 150);
                var top = node.top !== undefined ? node.top : 50;
                $nodeDiv.css({ position: "absolute", left: left, top: top });
            }

            if(nodeType === "material"){
                var materialHtml = '<div class="material-content" style="text-align:center;">' + nodeName + '</div>' +
                    '<div class="material-ratio" style="text-align:center; font-size:12px;">比例：' + (nodeNum || '?') + '</div>';
                $nodeDiv.html(materialHtml);
            } else {
                $nodeDiv.addClass("craft");
                if(!node.style){
                    $nodeDiv.css({
                        "border-radius": "50%",
                        "width": "50px",
                        "height": "50px",
                        "line-height": "50px",
                        "text-align": "center",
                        "overflow": "hidden"
                    });
                }
                $nodeDiv.html(nodeName);
            }

            $("#diagramCanvas").append($nodeDiv);
            jsPlumbInstance.draggable($nodeDiv, { grid: [5,5] });
            jsPlumbInstance.addEndpoint(nodeId, {
                anchors: ["Right"],
                isSource: true,
                isTarget: true,
                maxConnections: -1
            });
            jsPlumbInstance.addEndpoint(nodeId, {
                anchors: ["Left"],
                isSource: true,
                isTarget: true,
                maxConnections: -1
            });
        });

        // 还原所有连线
        $.each(diagramData.connections, function(i, conn){
            jsPlumbInstance.connect({
                source: conn.source,
                target: conn.target
            });
        });

        jsPlumbInstance.repaintEverything();
    });
});
