const history=[];
function addmessage(room,username,msg){
    const totalmsg={room,username,text:msg};
    history.push(totalmsg);
    return totalmsg;
}

function getmessage(room){
    const messages = [];
    history.forEach(element => {
        if(element.room === room){
            messages.push(element);
        }
    });

    return messages;
}

function deletemessage(room){
    var i=0;
    while(i<history.length){
        if(history[i].room === room){
            history.splice(i,1);
        }
        else
        ++i;
    }
}

module.exports={
    addmessage,
    getmessage,
    deletemessage
}