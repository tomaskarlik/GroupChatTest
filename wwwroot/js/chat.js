"use strict";

var connection = null;

document.getElementById("connect").addEventListener("click", function (event) {
    var elGroup = document.getElementById("groupId");
    var groupId = elGroup.options[elGroup.selectedIndex].value;
  
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub?groupId=" + groupId)
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.on("ReceiveMessage", function (label, message, notify) {
        var encodedMsg = label + ": " + message;
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        document.getElementById("messagesList").appendChild(li);
        if (notify == "true") {
            notifyUser("Zpráva od " + label);
        }
    });

    connection.on("ReceiveMessageFromMe", function (message) {
        var li = document.createElement("li");
        var msg = li.appendChild(document.createElement("i"));
        msg.textContent = message;
        document.getElementById("messagesList").appendChild(li);
    });

    connection.start().catch(function (err) {
        return console.error(err.toString());
    });

    document.getElementById("connect").setAttribute('disabled', 'true');
    document.getElementById("groupId").setAttribute('disabled', 'true');
    document.getElementById("user").setAttribute('disabled', 'true');

    event.preventDefault();
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    event.preventDefault();
    if (connection == null) {
        alert('Nejste pripojeni!');
        return;
    }

    var message = document.getElementById("messageInput").value;
    var elGroup = document.getElementById("groupId");
    var groupId = elGroup.options[elGroup.selectedIndex].value;
    var user = document.getElementById("user").value;
 
    connection.invoke("SendMessage", user, groupId, message).catch(function (err) {
        return console.error(err.toString());
    });

    document.getElementById("messageInput").value = "";
});


function notifyUser(msg) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(msg);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification(msg);
            }
        });
    }

    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
}