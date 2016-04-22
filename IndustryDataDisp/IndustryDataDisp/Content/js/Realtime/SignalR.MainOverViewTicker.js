// Crockford's supplant method (poor man's templating)
if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function setCatagory(catagory, type) {
    var ticker = $.connection.realtimejituanTicker;
    ticker.server.setCatagory(getQueryString("organizeid"), catagory, type, $("#userid").val(), $("#langid").val());
}
function startServerConn() {
    var ticker = $.connection.realtimejituanTicker;
    $.extend(ticker.client, {
        loadMainTableData: function (result) {
            //点击选择时，后台查询间隔太长，后台刷新的数据会把选择查询的覆盖掉
            //loadMainTableData(result);
        },
        recordMainLog: function (msg) { console.log(msg); },
        loadMainChartData: function (data) {
            loadMainChartData(data);
            console.log("reveive realdata complete!" + data);
        }
    });
    //$.connection.hub.logging = true;
    $.connection.hub.start()
        .then(function () {
            ticker.server.setCatagory(getQueryString("organizeid"), "", "", $("#userid").val(), $("#langid").val());
        });
}
//为图表加载数据
$(function () {
    addFrame();
    
    var url =encodeURI( window.location.origin + "/operationoverview/GetMainChartData" + "?organizeid=" + getQueryString("organizeid") + "&timemills=" + new Date().getTime());
    $.get(url, function (result) {
        loadMainChartData(result);
        removeFrame();
        //startServerConn();
    }).error(function (xhr, errorText, errorType) {
        console.log("无法加载数据！请检查服务器设置");
        removeFrame();
    });
});
//根据条件查询表格数据
var Tcatagory = "";
var Ttype = "";
$(function () {
    var $table = $('#maintable');
    $(function () {
        $table.bootstrapTable('load', "");
    });
});
function fetchTableData(catagory, type) {
    var url =encodeURI( window.location.origin + "/operationoverview/GetMainTableData" + "?organizeid=" + getQueryString("organizeid") + "&catagory=" + catagory + "&type=" + type + "&timemills=" + new Date().getTime());
    $.get(url, function (result) {
        $('#maintable').bootstrapTable('load', result);
    });
}
function loadMainTableData(result) {
    $('#maintable').bootstrapTable('load', result);
}
//初始化图表
var mainChart = echarts.init(document.getElementById('main'), theme);
var pumpstatChart = echarts.init(document.getElementById('pumpstat'), theme);
var inpressChart = echarts.init(document.getElementById('inpress'), theme);
var outpressChart = echarts.init(document.getElementById('outpress'), theme);
var ntuChart = echarts.init(document.getElementById('ntu'), theme);
var ppmChart = echarts.init(document.getElementById('ppm'), theme);
var energyChart = echarts.init(document.getElementById('energy'), theme);
mainChart.setOption(
    option = {
        legend: {
            data: ['平均无故障时间']
        },
        tooltip: {
            trigger: 'axis',
            formatter: "平均无故障时间 : <br />{b}月 : {c}小时"
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} 小时'
            }
        },
        xAxis: {
            type: 'category',
            axisLine: { onZero: false },
            axisLabel: {
                formatter: '{value} 月'
            },
            boundaryGap: false,
            data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        },
        series: [
            {
                name: '平均无故障时间',
                type: 'bar',
                smooth: true,
                lineStyle: {
                    normal: {
                        color: 'rgba(255,255,0,1)',
                        width: 3,
                        shadowColor: 'rgba(0,0,0,1.4)',
                        shadowBlur: 10,
                        shadowOffsetY: 10
                    }
                },
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    });
pumpstatChart.setOption(
    option = {
        color: ['#7bbc28', '#dca600', '#bc2828', '#535353'],
        title: {
            text: '泵房状态',
            x: 'center',
            y: 'bottom',
            textStyle: { fontSize: 15 }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br />{b} : {c} ({d}%)"
        },
        label: null,
        series: [
            {
                name: '',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: [
                    { value: 0, name: '正常' },
                    { value: 0, name: '停机' },
                    { value: 0, name: '报警' },
                    { value: 0, name: '离线' }
                ],
                itemStyle: {
                    color: ['#000', '#000', '#000', '#000'],
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    });
inpressChart.setOption(option = {
    color: ['#7bbc28', '#dca600', '#bc2828', '#535353'],
    title: {
        text: '进水压力',
        x: 'center',
        y: 'bottom',
        textStyle: { fontSize: 15 }
    },
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br />{b} : {c} ({d}%)"
    },
    series: [
        {
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
                { value: 0, name: '正常' },
                { value: 0, name: '低压' },
                { value: 0, name: '超压' }
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
});
outpressChart.setOption(option = {
    color: ['#7bbc28', '#dca600', '#bc2828', '#535353'],

    title: {
        text: '出水压力',
        x: 'center',
        y: 'bottom',
        textStyle: { fontSize: 15 }
    },
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br />{b} : {c} ({d}%)"
    },
    series: [
        {
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
               { value: 0, name: '正常' },
                { value: 0, name: '低压' },
                { value: 0, name: '超压' }
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
});
ntuChart.setOption(option = {
    color: ['#7bbc28', '#dca600', '#bc2828', '#535353'],
    title: {
        text: '浊度',
        x: 'center',
        y: 'bottom',
        textStyle: { fontSize: 15 }
    },
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br />{b} : {c} ({d}%)"
    },
    series: [
        {
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
                { value: 0, name: '正常' },
                { value: 0, name: '报警' },
                { value: 0, name: '超标' }
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
});
ppmChart.setOption(option = {
    color: ['#7bbc28', '#dca600', '#bc2828', '#535353'],
    title: {
        text: '余氯',
        x: 'center',
        y: 'bottom',
        textStyle: { fontSize: 15 }
    },
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br />{b} : {c} ({d}%)"
    },
    series: [
        {
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
                { value: 0, name: '正常' },
                { value: 0, name: '报警' },
                { value: 0, name: '超标' }
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
});
energyChart.setOption(
    option = {
        tooltip: {
            formatter: "{a} <br /> {c} {b} "
        },
        series: [
            {
                name: '单位能耗',
                type: 'gauge',
                detail: { formatter: '{value}' },
                data: [{ value: 0, name: '' }]
            }
        ]
    });

function addFrame() { document.getElementById("loading").style.display = "block"; $("#loading").css("height", window.document.body.offsetHeight); }
function removeFrame() { document.getElementById("loading").style.display = "none"; }
function loadMainChartData(mainChart) {
    if (mainChart == null || mainChart == undefined) { return 0; console.log("empty result"); }
    var chartData = mainChart;
    if (mainChart.mainChart != null || mainChart.mainChart != undefined) { setMainChartData(chartData.mainChart); }
    setpumpstatChartData(chartData.pumpstatChart);
    setinpressChartData(chartData.inpressChart);
    setoutpressChartData(chartData.outpressChart);
    setntuChartData(chartData.ntuChart);
    setppmChartData(chartData.ppmChart);
    setenergyChartData(chartData.energyChart);
}
function setMainChartData(data) {
    mainChart.setOption({
        series: [{
            data: data.data
        }]
    });
}
function setpumpstatChartData(data) {
    pumpstatChart.setOption({
        series: [{
            data: data.pieDataList
        }]
    });
}
function setinpressChartData(data) {
    inpressChart.setOption({
        series: [{
            data: data.pieDataList
        }]
    });
}
function setoutpressChartData(data) {
    outpressChart.setOption({
        series: [{
            data: data.pieDataList
        }]
    });
}
function setntuChartData(data) {
    ntuChart.setOption({
        series: [{
            data: data.pieDataList
        }]
    });
}
function setppmChartData(data) {
    ppmChart.setOption({
        series: [{
            data: data.pieDataList
        }]
    });
}
function setenergyChartData(data) {
    energyChart.setOption({
        series: [{
            data: data.energyData
        }]
    });
}

//触发事件
mainChart.on('click', function (params) {
});
pumpstatChart.on('click', function (params) {
    $("#labelStat").html("泵房状态：" + params.name); fetchTableData('pumpstatChart', params.name); setCatagory('pumpstatChart', params.name);
});
inpressChart.on('click', function (params) {
    $("#labelStat").html("进水压力：" + params.name); fetchTableData('inpressChart', params.name); setCatagory('inpressChart', params.name);
});
outpressChart.on('click', function (params) {
    $("#labelStat").html("出水压力：" + params.name); fetchTableData('outpressChart', params.name); setCatagory('outpressChart', params.name);
});
ntuChart.on('click', function (params) {
    $("#labelStat").html("浊度：" + params.name); fetchTableData('ntuChart', params.name); setCatagory('ntuChart', params.name);
});
ppmChart.on('click', function (params) {
    $("#labelStat").html("余氯：" + params.name); fetchTableData('ppmChart', params.name); setCatagory('ppmChart', params.name);
});
energyChart.on('click', function (params) {
});