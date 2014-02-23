
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.type == "content script") {
//       link = (request.link);
//     }
// });

aTag = document.getElementsByTagName("a")
for (i = 0; i < aTag.length; i++) {
    if (aTag[i].getAttribute("href") == link)
        //aTag[i].setAttribute("target", "_blank");
        aTag[i].click();
}
// document.getElementsByTagName("a")[0].innerHTML = link;
document.body.style.backgroundColor="red"


