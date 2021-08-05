const socket = io();

//Element 
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $message = document.querySelector('#message');

//template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate =document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Option
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true}); // queary string
//QS.parse get value from search bar ? quetion mark 
const autoscroll =()=>{
    const $newMessage = message.lastElementChild

    //heigh of new message
    const newmessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newmessageStyles.marginBottom)
    const newMesageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageMargin);
    //visible height

    const visibleHeight = $message.offsetHeight;
    // height of message container
    const containerHeight = $message.scrollHeight;
    // how far have i scrolled

    const scrollOffSet = $message.scrollTop + visibleHeight;


    if(containerHeight-newMesageHeight -5 <= scrollOffSet) {
        $message.scrollTop = $message.scrollHeigh;
    }

}

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    });
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();
})
socket.on('locationMessage',(message)=>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a') // shorthand syntax when bth same
    })
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();
})
socket.on('roomData',({room,users}) =>{
    // console.log(room)
    // console.log(users);

    const html = Mustache.render(sidebarTemplate,{
        room,
        users

    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    //disable 
    $messageFormButton.setAttribute('disabled','disabled');
    const message = document.querySelector('input').value;

    socket.emit('sendMessage',message, (error)=>{
        //enable 
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
       if(error){
           return console.log(error);
       }
       console.log('message Delivered!');
    });
});

$sendLocationButton.addEventListener('click',(e)=>{
    e.preventDefault();
    $sendLocationButton.setAttribute('disabled','disabled');
    if(!navigator.geolocation){
        return alert('Not support Geolocation in your Browser');
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position);
        // const latitude = position.coords.latitude;
        // const longitude = position.coords.longitude;
        // // console.log(latitude,longitude);
        // const message = document.querySelector('input').value;
        // socket.emit('sendMessage',`${latitude} ${longitude}`);

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!');
        })
    })
})

socket.emit('join',{username,room} ,(error) =>{
    if(error){
        alert(error);
        location.href='/';
    }
})