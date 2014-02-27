
function WebPage(url, srcUrl, srcDomain,srcType) {
  this.url = url;                //WebPage is the object we open tab and record requests
  this.srcUrl = srcUrl;           //srcUrl record where do we get this WebPage, it is url from alex
  this.srcDomain = srcDomain;         //The domain of srcUrl
  this.srcType = srcType;             //0: itself, 1: From In domain 2: From Cross Domain
  this.requestsList = new Array();        //the requests we got when visiting this web page.
  this.tab = "";
}


//var openUrl = new Array();

var TrackHead = {




  runned: 0,
  WebPageList: new Array(WebPage),
  weblist: [],
  startPage: 0,
  max: 2,                   //how many pages to climb in alexa, every page 25 websites
  inDomainNum: 0,
  crossDomainNum: 5,
  countInDomain: 0,
  inDomainLink: new Array(),
  inDomainRecord: new Array(),      //for optimization, record those that we have put in.
  inDomainLib: new Array(),
  countCrossDomain: 0,
  crossDomainLink: new Array(),
  crossDomainRecord: new Array(),
  crossDomainLib: new Array(),
  domainEnough: 0,
  acceptFileType: ["asp", "html"],
  acceptDomain: ["com", "cn", "org"],
  kindANum: 0,                //number of href like href = "/default.asp"
  kindA: 0,                    //initial number of kindA
  currentI: 0,

  fetchWeblist: function (min, max) {
    var start = 0;
    var loopEnd = 0;

    if (min != undefined && max != undefined) {
        start = min;
        loopEnd = max;
    }
    else {
      start = this.startPage;
      end = this.max;
    }
    var webHead = "http://www.";
    var weburlHead = "http://www.alexa.com/topsites/global;"

    for (var i = start; i < loopEnd; i++) {
      if (i == 0) 
        var webUrl = 'http://www.alexa.com/topsites'
      else 
        webUrl = weburlHead + i;
      var request = new XMLHttpRequest();
      request.open("GET", webUrl, false);
      request.send(null);
//       request.onreadystatechange = function() {
//         if (request.readyState == 4) {
      var content = request.responseText;
      var begin = content.indexOf("siteinfo/") - 200;
      var end = content.indexOf("\n", begin);
      while (end != -1) { 
        line = content.substring(begin, end); 
        if (line.indexOf("siteinfo/") != -1) {
          var a = line.indexOf("siteinfo/") + 9
          var b = line.lastIndexOf("\"");
          var webMain = line.substring(a, b);
          var web = webHead + webMain;
          this.weblist.push(web);
        }
        begin = end + 1;
        end = content.indexOf("\n", begin);
      }
    }
    //this.showWeblist();
  }, //end of function fetchWeblist;

  showWeblist: function() {
    for (var i = 0; i <= this.weblist.length; i++) {
      console.log(this.weblist[i]);
    }
  },

  fetchFinalList: function(i) {                                      //fetch all cross(indomain) link of all websites in weblist
     // this.weblist = ['http://www.wikipedia.com'];
     // this.weblist.push("http://www.ebay.com");

    var request = new XMLHttpRequest();
    console.log(i + this.weblist[i]);
    request.open("GET", this.weblist[i], true);
    //TrackHead.currentI = i;
    request.send();
    var content = request.responsetText;
    TrackHead.inDomainLink.push(TrackHead.weblist[i]);
    if (buildCross.runned == 1) {
      TrackHead.crossDomainLink.push(TrackHead.weblist[i]);   //We should also open the "A" page.
    }
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
        var content = request.responseText;
        TrackHead.countInDomain = 0;
        TrackHead.countCrossDomain = 0;
        TrackHead.domainEnough = 0;
        TrackHead.kindA = 0;
        TrackHead.getATag(content, TrackHead.weblist[i]);

        TrackHead.finalize();
        //console.log(content); 
        if (i + 1 < TrackHead.weblist.length) {
          TrackHead.fetchFinalList(i + 1);                      //recursively call itself.
        }
        else {
          TrackHead.finalize();
          console.log("end");
          if (buildCross.runned == 1 && buildCross.secondCross == 0){
            buildCross.secondCross = 1;
            buildCross.second();
          }
          else if (buildCross.runned == 1 && buildCross.secondCross == 1 && buildCross.thirdCross == 0) {
            buildCross.thirdCross = 1;
            buildCross.third();
          }
        }
      }
    }
  },  //end of fetchFinalList    

  finalize: function() {
    var tmp = TrackHead.inDomainNum - TrackHead.countInDomain;

    while ((tmp--) > 0 && TrackHead.inDomainLib.length > 0) {
      var randomNumber=Math.floor(Math.random()*(TrackHead.inDomainLib.length));
      var tmphref = TrackHead.inDomainLib.pop(randomNumber);
      TrackHead.inDomainLink.push(tmphref);
      console.log("In from backup: " + tmphref);
    }
    
    var tmp = TrackHead.crossDomainNum - TrackHead.countCrossDomain;
    
    while ((tmp--) > 0 && TrackHead.crossDomainLib.length > 0 ) {
      var randomNumber=Math.floor(Math.random()*(TrackHead.crossDomainLib.length));
      var tmphref = TrackHead.crossDomainLib.pop(randomNumber);
      TrackHead.crossDomainLink.push(tmphref);
      console.log("Cross from backup: " + tmphref);
    }


    TrackHead.crossDomainLib = new Array();
    TrackHead.inDomainLib = new Array();
    TrackHead.crossDomainRecord = new Array();
    TrackHead.inDomainRecord = new Array();

  },

  getATag: function(content, webAddress) {
 
    var lineBegin = 0;
    var lineEnd = content.indexOf('\n', lineBegin);
    
    var printCount = 0;

    //console.log("In getATag");

    while (lineEnd != -1 && (TrackHead.countInDomain < TrackHead.inDomainNum 
                          || TrackHead.countCrossDomain < TrackHead.crossDomainNum) ) {
      var line = content.substring(lineBegin, lineEnd);
      var site = line.indexOf("<a");
      while (site != -1 && (TrackHead.countInDomain < TrackHead.inDomainNum || TrackHead.countCrossDomain < TrackHead.crossDomainNum) ) {
        siteEnd = line.indexOf(">", site);
        taga = line.substring(site, siteEnd + 1)
        //if (printCount % 300 == 0) 
          //console.log(taga);
        tagaHref = taga.indexOf("href=\"");
        if (tagaHref == -1) 
          tagaHref = taga.indexOf("href=\'");
        if (tagaHref != -1) {
          var tagaHrefEnd = taga.indexOf("\"", tagaHref + 6);
          if (tagaHrefEnd == -1) 
            tagaHrefEnd = taga.indexOf("\'", tagaHref + 6);     //end quote
          tagaWeb = taga.substring(tagaHref + 6 , tagaHrefEnd);  //tagaWeb is the content of href.
          // if (printCount % 300 == 0) {
          //   console.log(tagaWeb);
          // }
          TrackHead.classifyHref(tagaWeb, webAddress);
        }

        if (siteEnd == -1) 
          site = -1;
        else
          site = line.indexOf("<a", siteEnd);
        printCount++;
      }
      lineBegin = lineEnd + 1;
      lineEnd = content.indexOf('\n', lineBegin);
    }
  },//end of function getATag

  /**
   * Given the content of a href tag, determine whether in-domain or cross-domain link
  
  */
  classifyHref: function(href, webAddress) {
    dotPlace = webAddress.indexOf('.');
    //webDomain = webAddress.substring( dotPlace + 1, webAddress.indexOf('.', dotPlace + 1));
    //console.log(webAddress.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1]);
    tmpSplit = webAddress.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1].split(".");
    webDomain = tmpSplit[ tmpSplit.length - 2 ];
    domainKind = tmpSplit[tmpSplit.length - 1];
    //domainKind = webAddress.substring(webAddress.indexOf(webDomain) + webDomain.length + 1);

    if (TrackHead.acceptDomain.indexOf(domainKind) == -1)
      TrackHead.acceptDomain.push(domainKind);

    //This part deal with situations like :  href="/default.asp"
    if (href[0] == '/' && href.length > 2 && (TrackHead.kindA++) < TrackHead.kindANum && href[1] != "/") {
      link = webAddress + href;
      if ((href.indexOf(".") == -1) && TrackHead.inDomainLink.indexOf(link) == -1 
                                      && TrackHead.countInDomain < TrackHead.inDomainNum ){
        if ( (TrackHead.kindA++) < TrackHead.kindANum ) {
          TrackHead.inDomainLink.push(link);
          console.log("In + /:" + link);
          TrackHead.countInDomain++;
        }
        else if (TrackHead.inDomainLib.indexOf(link) == "-1") {
          TrackHead.inDomainLib.push(link);
        }
        
      }
      else {
        fileType = href.substring(href.indexOf(".") + 1);
        if (TrackHead.acceptFileType.indexOf(fileType) != -1 
          && TrackHead.inDomainLink.indexOf(link) == -1
          && TrackHead.countInDomain < TrackHead.inDomainNum ) {
          if ( (TrackHead.kindA++) < TrackHead.kindANum ) {
            TrackHead.inDomainLink.push(link);
            TrackHead.countInDomain++;    
            console.log("In + /:" + link);
          }
          else if (TrackHead.inDomainLib.indexOf(link) == "-1") {
            TrackHead.inDomainLib.push(link);
          }
        }
      }
    }       
    else if(href.substring(0,4) == "http" || href.substring(0, 5) == "https" || href.substring(0,2) == "//" ) {

      if (href.substring(0, 2) == "//") {
        href = href.replace("//", "http://");
      }

      firstDot = href.indexOf(".", 0);
      firstWord = href.substring(href.indexOf("//") + 2, firstDot);
      var isInDomain = 0;
      if (firstWord == webDomain) 
        isInDomain = 1;
      else {
        secondDot = href.indexOf(".", firstDot + 1);
        if (secondDot != -1) {
          secondWord = href.substring(firstDot + 1, secondDot);
          if (secondWord == webDomain) 
            isInDomain = 1;
          else {
            thirdDot = href.indexOf(".", secondDot + 1);
            if (thirdDot != -1) {
              thirdWord = href.substring(secondDot + 1, thirdDot);
              thirdWord == webDomain ? isInDomain = 1 : isInDomain = 0;
            }
          }
        }
        else { secondWord = href.substring(firstDot + 1); }
      }
      //isInDomain means it contain domain name in first three words.
      if (isInDomain) {
        var domainLocation = href.indexOf(webDomain);
        if (href.substr(domainLocation, webDomain.length               
          + 1 + domainKind.length) == webDomain + "." + domainKind
          || TrackHead.acceptDomain.indexOf(domainKind) != -1) {
          if ((TrackHead.inDomainRecord.indexOf(firstWord) == -1
              || TrackHead.inDomainRecord.indexOf(secondWord) == -1)
              && TrackHead.countInDomain < TrackHead.inDomainNum 
              && href != webAddress){
            TrackHead.inDomainLink.push(href);
            TrackHead.inDomainRecord.push(firstWord);
            TrackHead.inDomainRecord.push(secondWord);
            TrackHead.countInDomain++;
            console.log("In + /:" + href);
          } 
          else {
            TrackHead.inDomainLib.push(href);
          }
        }
      }
      else if (TrackHead.crossDomainRecord.indexOf(firstWord) == -1
            && TrackHead.crossDomainRecord.indexOf(secondWord) == -1 
            && href.indexOf(webDomain) == -1
            && TrackHead.countCrossDomain < TrackHead.crossDomainNum ){
        TrackHead.crossDomainRecord.push(firstWord);
        TrackHead.crossDomainRecord.push(secondWord);
        TrackHead.crossDomainLink.push(href);
        TrackHead.countCrossDomain++;
        console.log("cross: " + href);
      }
      else if (href.indexOf(webDomain) == -1 && TrackHead.crossDomainLib.indexOf(href) == -1) {
        TrackHead.crossDomainLib.push(href);
      }
      
    }

  },

  initWebPageList: function() {
      
      indexIn = 0;
      indexCross = 0;

      for (var index = 0; index < TrackHead.weblist.length; index++) {
        webAddress = TrackHead.weblist[index];
        dotPlace = webAddress.indexOf('.');
        webDomain = webAddress.substring( dotPlace + 1, webAddress.indexOf('.', dotPlace + 1));

        while ( index != TrackHead.weblist.length - 1 && TrackHead.inDomainLink[indexIn] != TrackHead.weblist[index + 1] ){
          if (TrackHead.inDomainLink[indexIn] == TrackHead.weblist[index]){
            tmpWebPage = new WebPage(TrackHead.weblist[index], '', webDomain, 0);
            TrackHead.WebPageList.push(tmpWebPage);
          }
          else {
            tmpWebPage = new WebPage(TrackHead.inDomainLink[indexIn],webAddress,webDomain,1);
            TrackHead.WebPageList.push(tmpWebPage);
          }
          indexIn++;
        }
        while ( index != TrackHead.weblist.length - 1 && TrackHead.crossDomainLink[indexCross] != TrackHead.weblist[index + 1] ){
          if (TrackHead.crossDomainLink[indexCross] != TrackHead.weblist[index]) {
            tmpWebPage = new WebPage(TrackHead.crossDomainLink[indexCross],webAddress,webDomain,2);
            TrackHead.WebPageList.push(tmpWebPage);
          }
          indexCross++;
        }
      }

      while (indexIn < TrackHead.inDomainLink.length) {
        if (TrackHead.inDomainLink[indexIn] == TrackHead.weblist[index - 1]){
          tmpWebPage = new WebPage(TrackHead.weblist[index - 1], '', webDomain, 0);
          TrackHead.WebPageList.push(tmpWebPage);
        }
        else {
          tmpWebPage = new WebPage(TrackHead.inDomainLink[indexIn],webAddress,webDomain,1);
          TrackHead.WebPageList.push(tmpWebPage);
        }
        indexIn++;
      }
      while (indexCross < TrackHead.crossDomainLink.length) {
        if (TrackHead.crossDomainLink[indexCross] != TrackHead.weblist[index - 1]) {
          tmpWebPage = new WebPage(TrackHead.crossDomainLink[indexCross],webAddress,webDomain,2);
          TrackHead.WebPageList.push(tmpWebPage);
        }
        indexCross++;  
      }

      for (var index = 1; index < TrackHead.WebPageList.length; index++) {
        console.log(TrackHead.WebPageList[index].url + " " + TrackHead.WebPageList[index].srcType);
      }

  },

  recordRequest: function(details) {
    console.log("Send Requests: " + details.timeStamp + details.url);
    if (TrackHead.currentI > 0){
      TrackHead.WebPageList[TrackHead.currentI].requestsList.push(details.url);
    }
    //openUrl[TrackHead.currentI] = details.url;
  },

  //
  track: function() {
    TrackHead.currentI++;
    if (TrackHead.currentI > 1) {
      chrome.tabs.remove(TrackHead.WebPageList[TrackHead.currentI - 1].tab);
    }
    chrome.tabs.create( { url: TrackHead.WebPageList[TrackHead.currentI].url }, function(tab) { 
      TrackHead.WebPageList[TrackHead.currentI].tab = tab.id;});

    if (TrackHead.currentI < TrackHead.WebPageList.length - 1 ) {
      
      setTimeout(function() {TrackHead.track()}, 3000);
    }
    else {
      setTimeout(function() {chrome.tabs.remove(TrackHead.WebPageList[TrackHead.currentI].tab)}, 3000);
      TrackHead.writeToHTML();
      TrackHead.runned = 0;
    }
  },

  start: function() {
    var xmlTabUrl = chrome.extension.getURL("test.html");
    chrome.tabs.create({ url: xmlTabUrl});
    //TrackHead.inDomainNum = document.getElementById("inDomainNum").value;
    console.log("Start");
    //TrackHead.fetchWeblist();
    TrackHead.fetchFinalList(0);
    TrackHead.initWebPageList();
    TrackHead.track();
    //chrome.webRequest.onBeforeRequest.addListener(TrackHead.recordRequest, {urls: [ "<all_urls>" ]} );  
  },

  writeToHTML: function() {
    var xmlTabUrl = chrome.extension.getURL("test.html");
    var newtext
    var newel
  // Look through all the pages in this extension to find one we can use.
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
      var view = views[i];

    // If this view has the right URL and hasn't been used yet...
      if (view.location.href == xmlTabUrl && !view.imageAlreadySet) {
        var x = view.document.getElementsByTagName("WEB")[0];

        for (var i = 1; i < TrackHead.WebPageList.length; i++) {
          var webPageEl = view.document.createElement("WEBPAGE");
          
          newel = view.document.createElement("URL");
          newtext = view.document.createTextNode(TrackHead.WebPageList[i].url);
          newel.appendChild(newtext);
          webPageEl.appendChild(newel);

          newel = view.document.createElement("SRC_DOMAIN");
          newtext = view.document.createTextNode(TrackHead.WebPageList[i].srcDomain);
          newel.appendChild(newtext);
          webPageEl.appendChild(newel);


          newel = view.document.createElement("REQUESTS_LIST");
          for (var j = 0; j < TrackHead.WebPageList[i].requestsList.length; j++) {
            newtext = view.document.createTextNode(TrackHead.WebPageList[i].requestsList[j]);
            newel.appendChild(newtext);
          }
          webPageEl.appendChild(newel);


          x.appendChild(webPageEl);
        }
        
        
        document.write("finished");
        break; // we're done
      }

    }
  }
}

// Run our kitten generation script as soon as the document's DOM is ready.
//document.addEventListener('DOMContentLoaded', function () {
  
chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse) {

        if(request.type == "new start" && TrackHead.runned == 0) {
            TrackHead.runned = 1;
            TrackHead.inDomainNum = request.inDomainNum;
            TrackHead.start(); 
        }        
});


var buildCross = {
  crossOpenList: new Object(),
  runned: 0,
  secondCross: 0,
  thirdCross: 0,
  currentI: 0,
  tablist: new Array(),
  openLinkList: new Array(),
  testPageID: 0,
  openLinkList1: new Array,
  openLinkList2: new Array,

  crossOpenListA: function(weblist) {
    for (i = 0; i < weblist.length; i++) {
      buildCross.crossOpenList[weblist[i]] = new Object();
    }
  },

  crossOpenListB: function(weblist) {
    newWeblist = new Array();

    for (i = 1; i < weblist.length; i++) {
      if ((weblist[i - 1] in buildCross.crossOpenList) && !(weblist[i] in buildCross.crossOpenList) ) {
        buildCross.crossOpenList[weblist[i - 1]].B = weblist[i];
        newWeblist.push(weblist[i])
        i++;
      }
    }
    return newWeblist;
  },

  crossOpenListC: function(weblist) {

    tmpB = new Array();
    for (x in buildCross.crossOpenList) {
      if (buildCross.crossOpenList[x].B != undefined) {
        tmpB.push(buildCross.crossOpenList[x].B);
      }
    }

    for (i = 1; i < weblist.length; i++) {
      if ( (tmpB.indexOf(weblist[i - 1] != -1) ) && ( tmpB.indexOf(weblist[i]) == -1) ) {
        for (x in buildCross.crossOpenList) {
          if (buildCross.crossOpenList[x].B == weblist[i - 1]) {
            buildCross.crossOpenList[x].C = weblist[i];
            i++;
          }
        }
      }
    }
  },

  blackList: function(list) {
    blackList = ["http://www.hao123.com", "http://www.imdb.com"]

    newList = new Array();

    var block = 0;


    for (i = 0; i < list.length; i++) {
      for (j = 0; j < blackList.length; j++) {
        if (list[i] == blackList[j])
          block = 1;
      }
      if (block == 0) {
        newList.push(list[i]);
      }
      block = 0;
    }

    return newList;

  },


  start: function(weblist, numA, numB) {
    console.log(weblist);
//    TrackHead.weblist = ['http://doe.cs.northwestern.edu/xpan/x.html'];
//    TrackHead.weblist = ["http://www.ebay.com"];
//    TrackHead.weblist.push("http://www.youtube.com");
    
      buildCross.crossOpenList = new Object();
      buildCross.tablist =  new Array();
      buildCross.openLinkList = new Array();
      TrackHead.weblist = new Array();
      TrackHead.crossDomainLink = new Array();

    TrackHead.weblist.push(weblist);

//    TrackHead.fetchWeblist();
    TrackHead.weblist = buildCross.blackList(TrackHead.weblist);


    var testPage = chrome.extension.getURL("test.html");
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
      var view = views[i];
      if (view.location.href == testPage){
        break;
      }
      if (i == views.length - 1) {
        chrome.tabs.create({ url: testPage}, function(tab){
          buildCross.testPageID = tab.id;    
        });
      }
    }


    buildCross.crossOpenListA(TrackHead.weblist);
    TrackHead.crossDomainNum = 1;
    TrackHead.fetchFinalList(0);
    //chrome.tabs.create({ url: ""});

  },

  second:function() {
    
    TrackHead.weblist = buildCross.crossOpenListB(TrackHead.crossDomainLink);
    TrackHead.crossDomainLink = new Array();

    TrackHead.fetchFinalList(0);

  },
  third:function(kind) {                                      //open link

    if (kind != 1) {
      buildCross.crossOpenListC(TrackHead.crossDomainLink);
      TrackHead.crossDomainLink = new Array();
      buildCross.constructList();
    }

    // if (buildCross.currentI > 0) {
    //   chrome.tabs.remove(buildCross.tablist[buildCross.currentI - 1]);
    // }
    // window.open(buildCross.openLinkList[buildCross.currentI])
    // buildCross.currentI++;
    //chrome.runtime.sendMessage({type: "content script", link:buildCross.openLinkList[buildCross.currentI].B})

    if (buildCross.openLinkList.length >= 100) {
      for (var i = 0; i < 100; i++) {
        buildCross.openLinkList1.push(buildCross.openLinkList[i]);
      }
      for (var i = 100; i < buildCross.openLinkList.length && i < 200; i++) {
        buildCross.openLinkList2.push(buildCross.openLinkList[i]);
      }
    }

    if (buildCross.openLinkList.length == 0) {  //send message to popup.js
      chrome.runtime.sendMessage({type: "check_result", noCross:1});
      buildCross.runned = 0;
      buildCross.secondCross = 0;
      buildCross.thirdCross = 0;
    }
    else {

      source = buildCross.openLinkList[buildCross.currentI];
      dest = buildCross.openLinkList[buildCross.currentI + 2];
      tmpSplit = source.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1].split(".");
      sourceDomain = tmpSplit[ tmpSplit.length - 2 ];
      if (sourceDomain == "com")
        sourceDomain = tmpSplit[ tmpSplit.length - 3 ];
      tmpSplit = dest.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1].split(".");
      destDomain = tmpSplit[ tmpSplit.length - 2 ];
      if (destDomain == "com")
        destDomain = tmpSplit[ tmpSplit.length - 3 ];
      chrome.runtime.sendMessage({type: "check_result", noCross:0, sourceDomain: sourceDomain, destDomain: destDomain});
      

      var testPage = chrome.extension.getURL("test.html");
      
      var views = chrome.extension.getViews();
      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == testPage && !view.imageAlreadySet) {
          var x = view.document.getElementsByTagName("p")[0];
          x.innerHTML = sourceDomain + "   " + destDomain
        }
      }
    
      

      chrome.tabs.create( { url: buildCross.openLinkList[buildCross.currentI] }, function(tab) { 
      
        setTimeout(function() {buildCross.openLinkB(tab.id, buildCross.currentI)}, 6000);
        
        buildCross.tablist[buildCross.currentI] = tab.id; 
      });
    }
  },

  openLinkB: function(tabA, currentI) {
    linkCode = "link = \"" + String(buildCross.openLinkList[currentI+ 1]) + "\";"
    try {
      chrome.tabs.executeScript(tabA, {
          code: linkCode
        }, function() {
          chrome.tabs.executeScript(tabA, { 
            file: "content_script.js"});
        });
      setTimeout(function() {buildCross.openLinkC(tabA, currentI)}, 6000);
    }
    catch(err) {
      console.log("Error in openLinkB");
      buildCross.currentI = currentI + 3;
      buildCross.removeTab(currentI);
    }
  },

  openLinkC: function(tabA, currentI) {
    linkCode = "link = \"" + String(buildCross.openLinkList[currentI+ 2]) + "\";"
    
    linkB = buildCross.openLinkList[currentI+ 1];
    var tabB

    try {      
      chrome.tabs.query({url: linkB}, function(result) {
        if (result.length > 0) {
          tabB = result[0].id;
          buildCross.tablist[currentI + 1] = tabB;
          chrome.tabs.executeScript(tabB, {
              code: linkCode
            }, function() {
              chrome.tabs.executeScript(tabB, { 
                file: "content_script.js"});
            });
          setTimeout(function() {buildCross.removeTab(currentI)}, 6000);
        }
        else {
          buildCross.removeTab(currentI);
        }
      });
    }
    catch(err) {
      console.log("Error in openLinkB");
      buildCross.currentI = currentI + 3;
      buildCross.removeTab(currentI);
    }
    
  },

  removeTab: function(currentI) {
    // linkC = buildCross.openLinkList[currentI + 2];
    // var tabC;
    // chrome.tabs.query({url: linkC}, function(result) {
    //   tabC = result[0].id;
    // });
    // buildCross.tablist[currentI + 2] = tabC;
    
    chrome.tabs.query({}, function(result) {
      for (i = 0; i < result.length - 2; i++) {
        if (result[i].id != buildCross.testPageID) {
          //chrome.tabs.remove(result[i].id);
        }
      }
      if (currentI < buildCross.openLinkList.length - 3) {
        buildCross.currentI = currentI + 3;
        buildCross.third(1);
      }
      else {
        buildCross.runned = 0;
        buildCross.secondCross = 0;
        buildCross.thirdCross = 0;
        console.log("Finished")
      }
    });
  },

  constructList: function() {
    for (x in buildCross.crossOpenList) {
      if (buildCross.crossOpenList[x].B != undefined && buildCross.crossOpenList[x].C != undefined 
        && !buildCross.checkDomain(x, buildCross.crossOpenList[x].C) ) {
        buildCross.openLinkList.push(x);
        buildCross.openLinkList.push(buildCross.crossOpenList[x].B)
        buildCross.openLinkList.push(buildCross.crossOpenList[x].C);
      }
    }
  },

  checkDomain: function(a, b) {
    tmpSplit = a.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1].split(".");
    webDomain1 = tmpSplit[tmpSplit.length - 2];
    tmpSplit = b.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1].split(".");
    webDomain2 = tmpSplit[tmpSplit.length - 2];

    if (webDomain1 == webDomain2) return 1;
    else return 0;

  }

}




chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "cross start" && buildCross.runned != 1) {
      buildCross.runned = 1;
      buildCross.start(request.webList, request.numA, request.numB);  
    }
});

//buildCross.runned = 1;
//buildCross.start();
//get_domain_name()
//a = buildCross.checkDomain("http://www.soso.com", "http://wenwen.soso.com/")


function get_domain_name()
{    
    testList = ["http://www.sogou.com"];
    testList.push("http://wenwen.soso.com/");
    testList.push("http://twitter.com/#!/eBay  ");
    testList.push("http://wikimediafoundation.org/");
    testList.push("https://meta.wikimedia.org/wiki/List_of_Wikipedias");

    //aaaa="http://somesite.se/blah/sese";
    console.log("test for get_domain_name \n")
    for (var i = 0; i < testList.length; i++) {
      console.log(testList[i].match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1]);
    }        
}
  
function framePage(url, frameDomains, crossLink) {
  this.url = url;
  this.frameDomains = frameDomains;
  this.crossLink = crossLink;
}

var checkiFrame = {            //This object is used to find iframes in websites and 
  framePages: new Array(),
  weblist: new Array(),

  start: function() {
    //TrackHead.weblist = ["http://www.163.com"];
    TrackHead.fetchWeblist(14,20)
    this.weblist = TrackHead.weblist;

    this.climbContent(0);
  },


  // climb ith element in weblist, construct framePages if satisfied.
  climbContent: function(i) {
    var request = new XMLHttpRequest();
    console.log(i + this.weblist[i]);
    request.open("GET", this.weblist[i], true);
    request.send();
    var content = request.responsetText;
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
        var content = request.responseText;
        tmpArray = checkiFrame.getiFrameTag(content, checkiFrame.weblist[i]);
        if (tmpArray.length != 0) {
          tmpLink = checkiFrame.getCrossLinkDiffDomains(content, checkiFrame.weblist[i], tmpArray);
          if(tmpLink != "") {
            checkiFrame.framePages.push(new framePage(checkiFrame.weblist[i], tmpArray, tmpLink));
          }
        }
        if (i + 1 < checkiFrame.weblist.length) {
          checkiFrame.climbContent(i + 1);           //recursively call itself.
        }
        else {
          console.log("end");             //Climb ends.
        }
      }
    }
  },  

  getDomain: function(web) {



    if (web.indexOf("javascript") != -1 || web.charAt(0) == "/" || web.charAt(0) == "#" 
      || web.length == 0 || web.indexOf("about:blank") != -1 || web.indexOf("//") == -1)
      return "-1";

    tmpSplit = web.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/)[1].split(".");
    webDomain = tmpSplit[tmpSplit.length - 2];
    

    if (webDomain == "com" || webDomain == "edu" || webDomain == "co") 
      webDomain = tmpSplit[tmpSplit.length - 3];
    return webDomain
  },

  //Input: content of page, website is the url
  //Output: return an array of iFrame domain, if exists
  getiFrameTag: function(content, website) {
    var frameDomains = new Array();
    var lineBegin = 0;
    var lineEnd = content.indexOf('\n', lineBegin);
    var webDomain = checkiFrame.getDomain(website);

    while (lineEnd != -1) {
      var line = content.substring(lineBegin, lineEnd);
      var frameBegin = line.indexOf("<iframe");
      while (frameBegin != -1) {
        frameEnd = line.indexOf(">", frameBegin);
        frame = line.substring(frameBegin, frameEnd + 1)
        frameSrc = frame.indexOf("src=\"");
        if (frameSrc == -1)
          frameSrc = frame.indexOf("src=\'");
        if (frameSrc != -1) {
          var frameSrcEnd = frame.indexOf("\"", frameSrc + 5);
          if (frameSrcEnd == -1)
            var frameSrcEnd = frame.indexOf("\'", frameSrc + 5);        
          frameWeb = frame.substring(frameSrc + 5, frameSrcEnd);
          frameDomain = checkiFrame.getDomain(frameWeb)
          if ( frameDomain != "-1" && frameDomain != webDomain && frameDomains.indexOf(frameDomain) == -1)
            frameDomains.push(frameDomain);
        }
        if (frameEnd == -1)
          frameBegin = -1;
        else
          frameBegin = line.indexOf("<iframe", frameEnd);
      }
      lineBegin = lineEnd + 1;
      lineEnd = content.indexOf("\n", lineBegin);
    }
    return frameDomains;
  },

  getCrossLinkDiffDomains: function(content, website, domainsArray) {
    var crossLink = "";
    var lineBegin = 0;
    var lineEnd = content.indexOf('\n', lineBegin);
    var webDomain = checkiFrame.getDomain(website);

    while (lineEnd != -1) {
      var line = content.substring(lineBegin, lineEnd);
      var site = line.indexOf("<a");
      while (site != -1) {
        siteEnd = line.indexOf(">", site);
        taga = line.substring(site, siteEnd + 1)
        tagaHref = taga.indexOf("href=\"");
        if (tagaHref == -1) 
          tagaHref = taga.indexOf("href=\'");
        if (tagaHref != -1) {
          var tagaHrefEnd = taga.indexOf("\"", tagaHref + 6);
          if (tagaHrefEnd == -1) 
            tagaHrefEnd = taga.indexOf("\'", tagaHref + 6);     //end quote
          tagaWeb = taga.substring(tagaHref + 6 , tagaHrefEnd);
          tagaDomain = checkiFrame.getDomain(tagaWeb);
          if (domainsArray.indexOf(tagaDomain) == -1 && webDomain != tagaDomain
            && tagaDomain != "-1") {
            crossLink = tagaWeb;
            return crossLink            //here we return the first cross link!!!
          }
        }
      if (siteEnd == -1) 
          site = -1;
        else
          site = line.indexOf("<a", siteEnd);
      }
      lineBegin = lineEnd + 1;
      lineEnd = content.indexOf('\n', lineBegin);
    }
    return crossLink;
  }
}

//checkiFrame.start();




