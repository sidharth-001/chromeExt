var images = [];
var badUrls = [];
var imgNum;

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "get_images"}, response => {
        imgNum = 0;
        if(!response){
            $('.gallery').append('<h2>No images were found on this page :(<br>Or the site does not allow web scraping.</h2>');
        }else{
            $('.gallery').html('');
            $('.gallery').append("<h3>Total number of images: <span id='image-num'>0</span></h3>");
            response.map((img) => {
                if(img){
                    var image = new Image();
                    image.src = img;
                    image.onerror = function(){
                        badUrls.push(this.src);
                        this.src = '../resources/badImage.jpg';
                    }
                    image.onclick = function(){
                        var link = document.createElement("a");
                        link.download = "image.png";
                        link.href = this.src;
                        link.click();
                    }
                    image.onload = function(){
                        if(this.naturalWidth>16 || this.naturalHeight>16){
                            $('.gallery').append(image);
                            images.push(image.src);
                            imgNum++;
                            document.getElementById('image-num').innerText = imgNum;
                        }
                    }
                }
            });
        }
    });
});
console.log("BAD URIs: ",badUrls);

function generateZIP(){
    var zip = new JSZip();
    var zipFilename = "Pictures.zip";
    var i=0;
    var badImg = 0;
    images.forEach((img) => {
        if(img){
            var myData = "";
            var filename = 'image_'+i+'.png';
            
            if(badUrls.includes(img)){
                badImg++;
                console.log("Bad image");
            }else if(/^data:image/.test(img)){
                let temp = images[i].split(',');
                myData = temp[1];
                if(/^data:image\/jpeg;base64,/.test(img)){
                    filename = 'image_'+i+'.jpg';
                }else{
                    filename = 'image_'+i+'.png';
                }
                zip.file(filename, myData, { base64: true });
            }else{
                function urlToPromise(url){
                    return new Promise(function(resolve, reject){
                        JSZipUtils.getBinaryContent(url, function (err, data) {
                            if(err){
                                reject(err);
                            }else{
                                resolve(data);
                            }
                        });
                    });
                }
                if(img.endsWith(".jpg")){
                    filename = 'image_'+i+'.jpg';
                }else if(img.endsWith(".gif")){
                    filename = 'image_'+i+'.gif';
                }else if(img.endsWith(".svg")){
                    filename = 'image_'+i+'.svg';
                }else{
                    filename = 'image_'+i+'.png';
                }
                zip.file(filename, urlToPromise(img), {binary:true});
            }
        }i++;
    });
    console.log("> ", badImg, " images have bad url and thus can't be downloaded.");
    zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(content, zipFilename);
    });
}

$(document).on('click', '#download_all', (e) => {
    if(images.length){
        generateZIP();
    }
});
