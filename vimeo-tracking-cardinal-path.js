//
// Google Analytics Tag Manager (V2) custom HTML tag for Vimeo video tracking

// Copyright 2016, Cardinal Path, Inc.

// Original author: Bill Tripple <btripple@cardinalpath.com>
// Revised by: Bogdan Bistriceanu <bbistriceanu@cardinalpath.com>

// Version 2.0
// 

<script>
var dataLayer = (typeof(dataLayer) !== "undefined" && dataLayer instanceof Array) ? dataLayer : [];
var videoLabels=[];
var lastP=[];

//we declare variables that will hold information about the video being played
var _playerTitle = {}, _playerAuthor = {}, _playerAuthorURL = {}, _playerUploadDate = {}; 

try{
    init();
}
catch(err){
    dataLayer.push({
        'event': 'gtm.error',
        'errorMessage': e.message,
        'tag': 'CP - UA - Vimeo Video Listener'
    })
}
function init(){
    try{
        var player=document.getElementsByTagName("iframe");
        for (i = 0; i < player.length; ++i) {
            var url=player[i].getAttribute("src");

            if(/player\.vimeo\.com\/video/.test(url)){ // vimeo iframe found
                if(!player[i].hasAttribute("id")){ // id attribute missing
                    player[i].setAttribute("id","vimeo_id_"+i); // add id attribute
                }
                var urlUpdated=false;
                if(!/api=/.test(url)){ // check to see if api parameter is in src attribute
                    url=updateUrl(url,"api",1);
                    urlUpdated=true;
                }

                if(!/player_id=/.test(url)){ // check if player_id is in src attribute
                    url=updateUrl(url,"player_id",player[i].getAttribute("id"));
                    urlUpdated=true;
                }
                if(urlUpdated){ // repopulate src attribute with added parameters
                    player[i].setAttribute("src",url)
                }
                videoLabels[player[i].getAttribute("id")]=player[i].getAttribute("src"); // id to label dictionary
            }
        }

        // Listen for messages from the player
        if (window.addEventListener){
            window.addEventListener('message', onMessageReceived, false);
        }
        else {
            window.attachEvent('onmessage', onMessageReceived, false);
        }
    }
    catch(err){
    }
}

function updateUrl(url,param,value){
    try{
        return url+((/\?/.test(url)) ? "&" : "?")+param+"="+value;  
    }
    catch(err){
    }
}

// Handle messages received from the player
function onMessageReceived(e) {
    try{
        var data = e.data;
		
		if(typeof data === "string"){
			data = JSON.parse(data);
		}
		
        switch (data.event) {
            case 'ready':
                onReady(data);
                break;
            case 'play':
                onPlay(data);
                break;
            case 'pause':
                onPause(data);
                break;
            case 'playProgress':
                onPlayProgress(data);
                break;
        }
    }
    catch(err){
    }
}

// Helper function for sending a message to the player
function post(action, value) {
    try{
        var data = {
          method: action
        };

        if (value) {
            data.value = value;
        }

        var message = JSON.stringify(data);
        var player = document.getElementsByTagName("iframe");
        var url;
        var prot;


        for (i = 0; i < player.length; ++i) {
        url=player[i].getAttribute("src");

            if(/player\.vimeo\.com\/video/.test(url)){
                // Check if protocol exists
                prot = player[i].getAttribute('src').split('?')[0].split('//')[0];

                // If protocol doesn't exist, then need to append to "url"
                if (!prot){
                    url="https:" + player[i].getAttribute("src").split('?')[0];
                }
            player[i].contentWindow.postMessage(data, url);
            }
        }
    }
    catch(err){
    }
}

function getLabel(id){
    try{
        return videoLabels[id].split('?')[0].split('/').pop();
    }
    catch(err){
    }
}

//our function that will use the Vimeo oEmbed API to retrieve additional information about the video
function getVimeoInfo(url, callback) {
            
    var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
                
        document.getElementsByTagName('body')[0].appendChild(script);
}

//the callback function which takes the data received from the Vimeo oEmbed API and places it into the corresponding objectes
function vimeoCallback(e){
    //console.log(e);
    _playerTitle[e['video_id']] = e['title'];
    _playerAuthor[e['video_id']] = e['author_name']
    _playerAuthorURL[e['video_id']] = e['author_url']
    _playerUploadDate[e['video_id']] = e['upload_date']
}

function onReady(data) {
    try{
        //execute our function which queries the Vimeo oEmbed API once the embedded videos are "ready"
        getVimeoInfo("https://www.vimeo.com/api/oembed.json?url=https://vimeo.com/"+getLabel(data.player_id)+"&callback=vimeoCallback", vimeoCallback);

        post('addEventListener', 'play');
        post('addEventListener', 'pause');
        post('addEventListener', 'finish');
        post('addEventListener', 'playProgress');
    }
    catch(err){
    }
}

function onPlay(data){
    try{
        dataLayer.push({
            event: "vimeo",
            eventCategory: "vimeo",
            eventAction: "vimeo play",
            eventLabel: _playerTitle[getLabel(data.player_id)].toLowerCase() + " - " + getLabel(data.player_id),
            vimeo_playerID: getLabel(data.player_id),
            vimeo_playerTitle: _playerTitle[getLabel(data.player_id)].toLowerCase(),
            vimeo_playerAuthor: _playerAuthor[getLabel(data.player_id)].toLowerCase(),
            vimeo_playerAuthorURL: _playerAuthorURL[getLabel(data.player_id)].toLowerCase(),
            vimeo_playerUploadDate: _playerUploadDate[getLabel(data.player_id)],
            nonInteractive: true
        });
    }
    catch(err){
    }
}

function onPause(data){
    try{
        dataLayer.push({
            event: "vimeo",
            eventCategory: "vimeo",
            eventAction: "vimeo video pause",
            eventLabel: _playerTitle[getLabel(data.player_id)].toLowerCase() + " - " + getLabel(data.player_id),
            vimeo_playerID: getLabel(data.player_id),
            vimeo_playerTitle: _playerTitle[getLabel(data.player_id)].toLowerCase(),
            vimeo_playerAuthor: _playerAuthor[getLabel(data.player_id)].toLowerCase(),
            vimeo_playerAuthorURL: _playerAuthorURL[getLabel(data.player_id)].toLowerCase(),
            vimeo_playerUploadDate: _playerUploadDate[getLabel(data.player_id)],
            nonInteractive: true
        });
    }
    catch(err){
    }
}

// Track progress: 25%, 50%, 75%, 100%
function onPlayProgress(data) {
    try{
        var t = data.data.duration - data.data.seconds <= 1.5 ? 1 : (Math.floor(data.data.seconds / data.data.duration * 4) / 4).toFixed(2); 
        if (!lastP[data.player_id] || t > lastP[data.player_id]) {
            lastP[data.player_id]=t;
            if (parseFloat(t) != 0){
                dataLayer.push({
                    event: "vimeo",
                    eventCategory: "vimeo",
                    eventAction: "vimeo video " +t*100+ "% Complete",
                    eventLabel: _playerTitle[getLabel(data.player_id)].toLowerCase() + " - " + getLabel(data.player_id),
                    vimeo_playerID: getLabel(data.player_id),
                    vimeo_playerTitle: _playerTitle[getLabel(data.player_id)].toLowerCase(),
                    vimeo_playerAuthor: _playerAuthor[getLabel(data.player_id)].toLowerCase(),
                    vimeo_playerAuthorURL: _playerAuthorURL[getLabel(data.player_id)].toLowerCase(),
                    vimeo_playerUploadDate: _playerUploadDate[getLabel(data.player_id)],
                    nonInteractive: true
                })
            }
        }
    }
    catch(err){
    }
}
</script>


