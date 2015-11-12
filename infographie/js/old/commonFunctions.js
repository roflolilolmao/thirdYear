function displayTitle(title, a, b, c, d, e, f, g) {
    // 1. To avoid recurrent issues with the console using MS-ie:
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};


    // 2. Display title with compatibility icons:
   /* var bro = new Array();
    bro = [a, b, c, d, e, f, g];
    var logoPPUR = "<img height='19' src='_siteImg/Logos/ppur_logo.png'> ";
    var logoHEArc = "<img height='19' src='_siteImg/Logos/he-arc_logo.png'> ";
    var path = "_siteImg/icons/";
    var icons = "";

    for (var i = 0; i < bro.length; ++i) {
        if (bro[i]) {
            icons += " <img src='" + path + "icon_";
            switch (i) {
                case 0:
                    icons += "fireWin7";
                    break;
                case 1:
                    icons += "ieWin7";
                    break;
                case 2:
                    icons += "chromWin7";
                    break;
                case 3:
                    icons += "chromLi";
                    break;a
                case 4:
                    icons += "fireMac";
                    break;
                case 5:
                    icons += "chromMac";
                    break;
                case 6:
                    icons += "safaMac";
                    break;
                default:
                    break;
            }
            if (bro[i] === 2) icons += "_asServer";
            icons += ".png'>";
        }
        //console.log( icons ); //--- DEBUG LINE ---
    }*/

    // make a similar title for all JS example presented in this course:
    var titleAsHeader = "<header><h1>&nbsp;" + title + "<br /></h1><br>&nbsp;&nbsp;<a href='http://webgl3d.info' style='text-decoration:none; color: white;'>WebGL par la pratique&copy; 2015</a></header>";
    document.write(titleAsHeader);
    document.title = title;
    
    var url = window.location.pathname;
	var filename = url.substring(url.lastIndexOf('/')+1);
	//console.log(filename);
}