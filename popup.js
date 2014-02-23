$(document).ready(function(){
    $('#submit').click(function(){

    // Get User Input in Text Box
    var inDomainNum = document.getElementById('inDomainNum').value;

    chrome.runtime.sendMessage({type: "new start", inDomainNum:inDomainNum});
    // Pass author variable to background.js
    
    });

    $('#startCross').click(function(){

    	var numA = document.getElementById('numA').value;
		var numB = document.getElementById('numB').value;

		var webList = document.getElementById('WebsitesList').value;

		chrome.runtime.sendMessage({type: "cross start", numA:numA, numB:numB, webList:webList});

    });


}); 



