var strFaderName = 'Dynamic Text Fader 2.20';
var strCopyright = 'Copyright (c) Nicholas Poh 2000';
// Check for browser and version
var g_fBrowser = 0;
var navName = navigator.appName;
var navVer = parseFloat(navigator.appVersion);
if (document.all) {
    // Microsoft Internet Explorer 5 or compatible
    g_fBrowser = 2;
} else if (document.getElementById) {
    // Netscape 6 or DOM compatible browser
    g_fBrowser = 3;
} else if (document.layers) {
    // Netscape 4 or compatible
    g_fBrowser = 1;
} else {
    // Sometimes Netscape 4 reaches here. So, make sure it still works.
    if (navName == "Netscape" && navVer >= 4) {
        g_fBrowser = 1;
    } else {
        // unknown and not supported
        g_fBrowser = 0;
    }
}
// End of check
// Global variables
var DynFaderList = new Array();		// List of Dynamic Faders
// End of Global variables
// Create a hex convertor array (Dex2Hex[])
var hexbase = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
var value = 0;
var Dec2Hex = new Array();
for (x = 0; x < 16; x++) {
    for (y = 0; y < 16; y++) {
        Dec2Hex[value] = hexbase[x] + hexbase[y];
        value++;
    }
}
// End of create a hex convertor array (Dex2Hex[])
// Combine RGB colour
function RGB(r, g, b) {
    return ((r & 0xFF) << 16) + ((g & 0xFF) << 8) + (b & 0xFF);
}
// Convert RGB colour from string to numeric
function StrRGB2Num(color) {
    var temp;
    temp = color;
    return Number('0x' + temp.substr(1, temp.length));
}
// Convert RGB colour to string base
function RGB2STR(rgbcolor) {
    return Dec2Hex[rgbcolor >> 16] + Dec2Hex[(rgbcolor >> 8) & 0xFF] + Dec2Hex[rgbcolor & 0xFF];
}
// Find layer
function findLayer(name, doc) {
    if (document.layers) {
        var i, layer;
        for (i = 0; i < doc.layers.length; i++) {
            layer = doc.layers[i];
            if (layer.name == name) return layer;
            if (layer.document.layers.length > 0) {
                layer = findLayer(name, layer.document);
                if (layer != null) return layer;
            }
        }
    }
    return null;
}
// Change the HTML text
function changeHTMLText(element, newText, object) {
    if (document.all) {
        // Microsoft Internet Explorer 5 or compatible
        element.innerHTML = newText;
    } else if (document.getElementById) {
        // Netscape 6 or DOM compatible browser
        rng = document.createRange();
        rng.setStartBefore(element);
        htmlFrag = rng.createContextualFragment(newText);
        while (element.hasChildNodes()) element.removeChild(element.lastChild);
        element.appendChild(htmlFrag);
    } else if (document.layers) {
        // Netscape 4 or compatible
        strTemp = '<DIV CLASS="' + object.name + '">' + newText + '</DIV>';
        element.document.open();
        element.document.fgColor = object.curcolor & 0xFFFFFF;
        element.document.writeln(strTemp);
        element.document.close();
    }
}
function insertPlaceHolder(strName, width, height, align, bgcolor, border, bordercolor) {
    if (String(width) == "undefined") var width = "100%";
    if (String(height) == "undefined") var height = 100;
    if (String(align) == "undefined") var align = "left";
    if (String(bgcolor) == "undefined") var bgcolor = "";
    if (String(border) == "undefined") var border = 0;
    if (String(bordercolor) == "undefined") var bordercolor = "";
    if (g_fBrowser == 0) {
        document.writeln("Browser not supported");
        return;
    }
    switch (g_fBrowser) {
        case 1:
            document.writeln(
                '<TABLE ALIGN="' + align + '" CELLSPACING="0" CELLPADDING="0" BORDER="' + border + '" BORDERCOLOR="' + bordercolor + '">' +
                '<TR><TD>' +
                '<ILAYER NAME="' + strName + '" BGCOLOR="' + bgcolor + '" VISIBILITY="inherit">' +
                '<LAYER NAME="Content" WIDTH=' + width + ' HEIGHT=' + height + ' VISIBILITY="inherit">' +
                '</LAYER>' +
                '</ILAYER>' +
                '</TD></TR>' +
                '</TABLE>'
            );
            break;
        case 2:
        case 3:
            document.writeln(
                '<DIV ALIGN=' + align + '>' +
                '<DIV ID="' + strName + '" STYLE="width:' + width + '; height:' + height + '; overflow:hidden; background:' + bgcolor + '; border-style:outset; border-width:' + border + '; border-color:' + bordercolor + '">' +
                '<DIV ID="' + strName + 'Content" STYLE="position:relative; width:100%;">' +
                '</DIV>' +
                '</DIV>' +
                '</DIV>'
            );
            break;
    }
}
function DynFader() {
    this.name;
    this.width;
    this.height;
    this.contentHeight;
    this.offset = 20;
    this.curXPos = 0;
    this.curYPos = -this.offset;
    this.curPos = 0;
    this.midYPos = 0;
    this.ydir = 1;
    this.xdir = 0;
    this.placeholder;
    this.content;
    this.text = new Array();
    this.curText = -1;
    this.loop = -1;
    this.paused = true;
    this.started = false;
    this.pauseInterval = 0;
    this.pauseTextInterval = 0;
    this.curpauseInterval = 0;
    this.fgcolor = 0x000000;
    this.bgcolor = 0xFFFFFF;
    this.dfcolor = 0;
    this.curdfcolor = 0;
    this.curcolor = 0;
    this.dfRed = 0;
    this.dfGreen = 0;
    this.dfBlue = 0;
    this.isFade = false;
    // Define methods
    this.addText = DynFaderAddText;
    this.attachPlaceHolder = DynFaderAttachPlaceHolder;
    this.setTextColor = DynFaderSetTextColor;
    this.start = DynFaderStart;
    this.stop = DynFaderStop;
    this.beginFade = DynFaderBeginFade;
    this.calcColorDif = DynFaderCalcColorDif;
    this.getColorDif = DynFaderGetColorDif;
    this.setFont = DynFaderSetFont;
    this.setFontSize = DynFaderSetFontSize;
    this.setBackground = DynFaderSetBackground;
    this.setDirection = DynFaderSetDirection;
    this.setSpeed = DynFaderSpeed;
    this.setPauseMidInterval = DynFaderSetPauseMidInterval;
    this.setPauseTextInterval = DynFaderSetPauseTextInterval;
    this.getContentHeight = DynFaderGetContentHeight;
    this.setLoop = DynFaderSetLoop;
    this.setGlow = DynFaderSetGlow;
    DynFaderList[DynFaderList.length] = this;
}
function DynFaderAddText(newText) {
    //解决拼接bug
    //this.text = null;
    this.text[this.text.length] = newText;
    //this.text = newText;
}
function DynFaderAttachPlaceHolder(strPlaceHolder) {
    switch (g_fBrowser) {
        case 1:
            this.name = strPlaceHolder;
            this.placeholder = findLayer(strPlaceHolder, document);
            this.content = this.placeholder.document.Content;
            this.width = this.placeholder.clip.width;
            this.height = this.placeholder.clip.height;
            this.content.top = this.curYPos;
            break;
        case 2:
            this.placeholder = eval('document.all.' + strPlaceHolder);
            this.content = eval('document.all.' + strPlaceHolder + 'Content');
            this.width = this.placeholder.style.pixelWidth;
            this.height = this.placeholder.style.pixelHeight;
            this.content.style.pixelTop = this.curYPos;
            break;
        case 3:
            this.placeholder = document.getElementById(strPlaceHolder);
            this.content = document.getElementById(strPlaceHolder + 'Content');
            this.width = parseInt(this.placeholder.style.width);
            this.height = parseInt(this.placeholder.style.height);
            this.content.style.top = this.curYPos;
            break;
    }
}
function DynFaderSetTextColor(r, g, b) {
    this.fgcolor = RGB(r, g, b);
    switch (g_fBrowser) {
        case 1:
            this.content.document.fgColor = this.fgcolor;
            break;
        case 2:
            this.content.style.color = this.fgcolor;
            break;
        case 3:
            this.content.style.color = "#" + RGB2STR(this.fgcolor);
            break;
    }
}
function DynFaderSetTextColor(strColor) {
    if (isNaN(strColor)) this.fgcolor = StrRGB2Num(strColor);
    this.curcolor = this.fgcolor;
    switch (g_fBrowser) {
        case 1:
            this.content.document.fgColor = this.color;
            break;
        case 2:
            this.content.style.color = this.fgcolor;
            break;
        case 3:
            this.content.style.color = "#" + RGB2STR(this.fgcolor);
            break;
    }
}
function DynFaderStart() {
    if (this.ydir > 0) {
        this.curYPos = this.height + 1;
    } else {
        this.curYPos = -this.getContentHeight() - 1;
    }
    this.started = true;
}
function DynFaderStop() {
    this.started = false;
}
function DynFaderBeginFade() {
    this.calcColorDif();
    this.isFade = true;
    this.start();
}
function DynFaderCalcColorDif() {
    switch (g_fBrowser) {
        case 1:
            this.bgcolor = this.placeholder.bgColor;
            if (this.bgcolor == null) this.bgcolor = StrRGB2Num(document.bgColor);
            break;
        case 2:
        case 3:
            this.bgcolor = StrRGB2Num(this.placeholder.style.backgroundColor);
            if (isNaN(this.bgcolor)) this.bgcolor = StrRGB2Num(document.bgColor);
            break;
    }
    this.dfRed = ((this.bgcolor >> 16) - (this.fgcolor >> 16));
    this.dfGreen = (((this.bgcolor >> 8) & 0xFF) - ((this.fgcolor >> 8) & 0xFF));
    this.dfBlue = ((this.bgcolor & 0xFF) - (this.fgcolor & 0xFF));
    this.curcolor = this.bgcolor;
}
function DynFaderGetColorDif(steps) {
    steps += this.height;
    steps >>= 1;
    steps /= Math.abs(this.ydir);
    this.curdfcolor = this.dfcolor = -(((this.dfRed / steps) << 16) + ((this.dfGreen / steps) << 8) + (this.dfBlue / steps));
}
function DynFaderSetFont(fontfamily, fontweight, textalign) {
    switch (g_fBrowser) {
        case 1:
            if (fontfamily) document.classes[this.name].all.fontFamily = fontfamily;
            if (fontweight) document.classes[this.name].all.fontWeight = fontweight;
            if (textalign) document.classes[this.name].all.textAlign = textalign;
            break;
        case 2:
        case 3:
            if (fontfamily) this.content.style.fontFamily = fontfamily;
            if (fontweight) this.content.style.fontWeight = fontweight;
            if (textalign) this.content.style.textAlign = textalign;
            break;
    }
}
function DynFaderSetFontSize(fontsize) {
    // Unit is required for Netscape 6
    if (!isNaN(fontsize)) fontsize += 'pt';
    switch (g_fBrowser) {
        case 1:
            if (fontsize) document.classes[this.name].all.fontSize = fontsize;
            break;
        case 2:
            this.content.style.fontSize = fontsize;
            break;
        case 3:
            this.content.style.fontSize = fontsize;
            break;
    }
}
function DynFaderSetBackground(image) {
    switch (g_fBrowser) {
        case 1:
            this.placeholder.background.src = image;
            break;
        case 2:
        case 3:
            this.placeholder.style.backgroundImage = 'url(' + image + ')';
            break;
    }
}
function DynFaderSetDirection(iDir) {
    switch (iDir) {
        case 0:
            this.ydir = Math.abs(this.ydir);
            break;
        case 1:
            this.ydir = -Math.abs(this.ydir);
            break;
        default:
            this.ydir = Math.abs(this.ydir);
    }
}
function DynFaderSpeed(Speed) {
    if (this.ydir > 0) {
        this.ydir = Math.abs(Speed);
    } else {
        this.ydir = -Math.abs(Speed);
    }
}
function DynFaderSetPauseMidInterval(time) {
    this.pauseInterval = Math.abs(time);
}
function DynFaderSetPauseTextInterval(time) {
    this.pauseTextInterval = Math.abs(time);
}
function DynFaderGetContentHeight() {
    switch (g_fBrowser) {
        case 1:
            this.contentHeight = this.content.document.height;
            break;
        case 2:
            this.contentHeight = this.content.clientHeight;
            break;
        case 3:
            this.contentHeight = this.content.offsetHeight;
            break;
    }
    return this.contentHeight;
}
function DynFaderSetLoop(loops) {
    this.loop = loops;
}
function DynFaderSetGlow(strength, glowColor, fgColor) {
    switch (g_fBrowser) {
        case 1:
            break;
        case 2:
            if (String(fgColor) != "undefined") this.setTextColor(fgColor);
            this.content.style.filter = "glow(color=" + glowColor + ",strength=" + strength + ")";
            break;
        case 3:
            break;
    }
}
// Scrolling section
function ScrollFader() {
    var fader;
    if (String(DynFaderList[0]) == "undefined") return;
    for (var i in DynFaderList) {
        fader = DynFaderList[i];
        if (fader.started == false) continue;
        if (fader.paused) {
            if (fader.curpauseInterval-- <= 0) {
                fader.paused = false;
            }
        } else {
            fader.curYPos += fader.ydir;
            //			fader.curXPos += fader.xdir;
            if (fader.curYPos == fader.midYPos) {
                if (fader.pauseInterval) {
                    fader.curpauseInterval = fader.pauseInterval;
                    fader.paused = true;
                }
                fader.curYPos = (fader.height - fader.contentHeight) >> 1;
                if (fader.isFade) {
                    fader.curdfcolor = -fader.dfcolor;
                    fader.curcolor = fader.fgcolor;
                }
            }
            if (fader.isFade) {
                // Change text colour
                switch (g_fBrowser) {
                    case 1:
                        if (fader.curText >= 0) {
                            changeHTMLText(fader.content, fader.text[fader.curText], fader);
                        }
                        break;
                    case 2:
                        fader.content.style.color = fader.curcolor;
                        break;
                    case 3:
                        fader.content.style.color = "#" + RGB2STR(fader.curcolor);
                        break;
                }
                fader.curcolor += fader.curdfcolor;
            }
            if (fader.curYPos > fader.height || fader.curYPos < -fader.contentHeight) {
                // Prepare for next text
                var ShowCopyright = false;
                if (++fader.curText > fader.text.length - 1) {
                    // End of text array reached
                    fader.curText = 0;
                    if (this.loop == -1) {
                        // infinite loop
                        if (Math.round(Math.random() * 20) == 7) {
                            ShowCopyright = true;
                            fader.curText = -1;
                        }
                    } else {
                        if (--fader.loop == 0) {
                            // Last loop reached
                            fader.stop();
                        }
                    }
                }
                // Rewrite the text
                switch (g_fBrowser) {
                    case 1:
                        fader.content.top = fader.height;
                        break;
                    case 2:
                        fader.content.style.pixelTop = fader.height;
                    case 3:
                        fader.content.style.top = fader.height;
                        break;
                }
                if (ShowCopyright) {
                    changeHTMLText(fader.content, strFaderName + '<BR>' + strCopyright, fader);
                } else {
                    changeHTMLText(fader.content, fader.text[fader.curText], fader);
                }
                // Reset values
                fader.getContentHeight();
                if (fader.isFade) {
                    fader.getColorDif(fader.contentHeight);
                    fader.curcolor = fader.bgcolor;
                }
                if (fader.ydir > 0) {
                    fader.midYPos = ((fader.height - fader.contentHeight) >> 1) + fader.contentHeight;
                    fader.midYPos = (Math.round(fader.midYPos / fader.ydir) * fader.ydir) - fader.contentHeight;
                    fader.curYPos = -fader.contentHeight;
                } else {
                    fader.midYPos = ((fader.height - fader.contentHeight) >> 1) + fader.height;
                    fader.midYPos = (Math.round(fader.midYPos / fader.ydir) * fader.ydir) - fader.height;
                    fader.curYPos = fader.height;
                }
                if (fader.pauseTextInterval) {
                    fader.curpauseInterval = fader.pauseTextInterval;
                    fader.paused = true;
                }
            }
            // Scroll text
            switch (g_fBrowser) {
                case 1:
                    fader.content.top = fader.curYPos;
                    break;
                case 2:
                    fader.content.style.pixelTop = fader.curYPos;
                    break;
                case 3:
                    fader.content.style.top = fader.curYPos;
                    break;
            }
        }
    }
}
// Start timer
var g_timerID;
if (g_fBrowser == 1) {
    var g_winWidth;
    var g_winHeight;
    g_winWidth = window.innerWidth;
    g_winHeight = window.innerHeight;
    window.captureEvents(Event.RESIZE);
    window.onResize = FaderReload;
}
setTimeout('FaderStart()', 600);
function FaderStart() {
    g_timerID = setInterval(ScrollFader, 20);
    window.onUnload = FaderUnload;
}
function FaderUnload(e) {
    clearInterval(g_timerID);
    return window.routeEvent(e);
}
function FaderReload(e) {
    if (g_winWidth == window.innerWidth && g_winHeight == window.innerHeight) return;
    this.location.href = this.location.href;
    this.focus();
    return window.routeEvent(e);;
}